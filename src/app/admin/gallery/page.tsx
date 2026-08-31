"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
// Icons use emoji instead of lucide-react
import MediaUploader from "@/components/admin/MediaUploader";

interface GalleryItem { id: string; image_url: string; title: string; description: string; category: string; display_order: number; published: boolean; }

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ image_url: "", title: "", description: "", category: "general" });

  const fetchData = useCallback(async () => {
    try { const sb = getSupabaseClient(); const { data } = await sb.from("gallery").select("*").order("display_order", { ascending: true }); setItems((data as GalleryItem[]) || []);    } catch (err) { console.error("Gallery fetch error:", err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    try {
      const sb = getSupabaseClient(); const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 0;
      if (editing) { await sb.from("gallery").update({ image_url: form.image_url, title: form.title, description: form.description, category: form.category }).eq("id", editing.id); }
      else { await sb.from("gallery").insert({ image_url: form.image_url, title: form.title, description: form.description, category: form.category, display_order: maxOrder, published: true }); }
      setShowModal(false); setEditing(null); setForm({ image_url: "", title: "", description: "", category: "general" }); fetchData();
    } catch (err) { console.error("Gallery save error:", err); alert("Failed to save: " + (err as Error).message); }
  };

  const deleteItem = async (id: string) => { if (!confirm("Delete?")) return; const sb = getSupabaseClient(); await sb.from("gallery").delete().eq("id", id); fetchData(); };

  const moveItem = async (item: GalleryItem, dir: "up" | "down") => {
    const idx = items.findIndex(i => i.id === item.id); const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return; const sb = getSupabaseClient(); const other = items[swapIdx]; const temp = item.display_order;
    await sb.from("gallery").update({ display_order: other.display_order }).eq("id", item.id);
    await sb.from("gallery").update({ display_order: temp }).eq("id", other.id); fetchData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Gallery</h2><p className="text-gray-500 text-sm mt-1">Manage gallery images</p></div>
        <button onClick={() => { setEditing(null); setForm({ image_url: "", title: "", description: "", category: "general" }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">+  Add Image</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
            <div className="aspect-square bg-gray-100 overflow-hidden relative">
              {item.image_url ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveItem(item, "up")} disabled={idx === 0} className="p-1 bg-white/90 rounded disabled:opacity-30">▲</button>
                <button onClick={() => moveItem(item, "down")} disabled={idx === items.length - 1} className="p-1 bg-white/90 rounded disabled:opacity-30">▼</button>
                <button onClick={() => deleteItem(item.id)} className="p-1 bg-white/90 rounded text-red-500"><span className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 truncate">{item.title || "Untitled"}</p>
              {item.category && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded mt-1 inline-block">{item.category}</span>}
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><p className="text-gray-500">No gallery items yet.</p></div>}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">{editing ? "Edit Image" : "Add Image"}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="prototype, event, research..." /></div>
              <MediaUploader label="Gallery Image *" type="image" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} required />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2.5 text-gray-700 bg-gray-100 font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={save} disabled={!form.image_url} className="px-4 py-2.5 text-white font-medium rounded-xl disabled:opacity-50" style={{ background: "linear-gradient(135deg, #4f7cff, #7c5cfc)" }}>{editing ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
