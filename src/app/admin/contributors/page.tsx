"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
// Icons use emoji instead of lucide-react

interface Contributor {
  id: string; name: string; photo_url: string | null; contribution: string;
  description: string; display_order: number; published: boolean;
}

export default function ContributorsAdmin() {
  const [items, setItems] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contributor | null>(null);
  const [form, setForm] = useState({ name: "", photo_url: "", contribution: "", description: "" });

  const fetchData = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data } = await sb.from("contributors").select("*").order("display_order", { ascending: true });
      setItems((data as Contributor[]) || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    try {
      const sb = getSupabaseClient();
      const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 0;
      const payload = { name: form.name, photo_url: form.photo_url || null, contribution: form.contribution, description: form.description };
      if (editing) {
        await sb.from("contributors").update(payload).eq("id", editing.id);
      } else {
        await sb.from("contributors").insert({ ...payload, display_order: maxOrder, published: true });
      }
      setShowModal(false); setEditing(null);
      setForm({ name: "", photo_url: "", contribution: "", description: "" });
      fetchData();
    } catch (err) { console.error(err); alert("Failed to save"); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete?")) return;
    const sb = getSupabaseClient();
    await sb.from("contributors").delete().eq("id", id);
    fetchData();
  };

  const moveItem = async (item: Contributor, dir: "up" | "down") => {
    const idx = items.findIndex(i => i.id === item.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const sb = getSupabaseClient();
    const other = items[swapIdx];
    const temp = item.display_order;
    await sb.from("contributors").update({ display_order: other.display_order }).eq("id", item.id);
    await sb.from("contributors").update({ display_order: temp }).eq("id", other.id);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Contributors</h2><p className="text-gray-500 text-sm mt-1">Manage project contributors</p></div>
        <button onClick={() => { setEditing(null); setForm({ name: "", photo_url: "", contribution: "", description: "" }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">+  Add Contributor</button>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => moveItem(item, "up")} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▲</button>
              <button onClick={() => moveItem(item, "down")} disabled={idx === items.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▼</button>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400 font-bold text-sm">
              {item.photo_url ? <img src={item.photo_url} alt="" className="w-full h-full object-cover" /> : item.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-gray-400 text-xs">{item.contribution}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditing(item); setForm({ name: item.name, photo_url: item.photo_url || "", contribution: item.contribution, description: item.description }); setShowModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
              <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><p className="text-gray-500">No contributors yet.</p></div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold">{editing ? "Edit" : "Add"} Contributor</h3><button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1 hover:bg-gray-100 rounded">✕</button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label><input type="url" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contribution</label><input type="text" value={form.contribution} onChange={(e) => setForm({ ...form, contribution: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Research, Design, Testing" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2.5 text-gray-700 bg-gray-100 font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={save} disabled={!form.name} className="px-4 py-2.5 text-white font-medium rounded-xl disabled:opacity-50" style={{ background: "linear-gradient(135deg, #4f7cff, #7c5cfc)" }}>{editing ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
