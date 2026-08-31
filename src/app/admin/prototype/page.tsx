"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
// Icons use emoji instead of lucide-react
import MediaUploader from "@/components/admin/MediaUploader";

interface Screen {
  id: string; title: string; description: string; detailed_description: string;
  image_url: string; category: string; display_order: number; pinned: boolean;
  published: boolean; youtube_url: string | null; audio_url: string | null;
}

export default function PrototypeAdmin() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Screen | null>(null);
  const [form, setForm] = useState({ title: "", description: "", detailed_description: "", image_url: "", category: "general", youtube_url: "", audio_url: "" });

  const fetchData = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data } = await sb.from("prototype_screens").select("*").order("display_order", { ascending: true });
      setScreens((data as Screen[]) || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    try {
      const sb = getSupabaseClient();
      const maxOrder = screens.length > 0 ? Math.max(...screens.map(s => s.display_order)) + 1 : 0;
      const payload = {
        title: form.title, description: form.description, detailed_description: form.detailed_description,
        image_url: form.image_url, category: form.category,
        youtube_url: form.youtube_url || null, audio_url: form.audio_url || null,
      };
      if (editing) {
        await sb.from("prototype_screens").update(payload).eq("id", editing.id);
      } else {
        await sb.from("prototype_screens").insert({ ...payload, display_order: maxOrder, pinned: false, published: true });
      }
      setShowModal(false); setEditing(null);
      setForm({ title: "", description: "", detailed_description: "", image_url: "", category: "general", youtube_url: "", audio_url: "" });
      fetchData();
    } catch (err) { console.error(err); alert("Failed to save"); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete?")) return;
    const sb = getSupabaseClient();
    await sb.from("prototype_screens").delete().eq("id", id);
    fetchData();
  };

  const togglePublished = async (s: Screen) => {
    const sb = getSupabaseClient();
    await sb.from("prototype_screens").update({ published: !s.published }).eq("id", s.id);
    fetchData();
  };

  const moveItem = async (s: Screen, dir: "up" | "down") => {
    const idx = screens.findIndex(x => x.id === s.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= screens.length) return;
    const sb = getSupabaseClient();
    const other = screens[swapIdx];
    const temp = s.display_order;
    await sb.from("prototype_screens").update({ display_order: other.display_order }).eq("id", s.id);
    await sb.from("prototype_screens").update({ display_order: temp }).eq("id", other.id);
    fetchData();
  };

  const openEdit = (s: Screen) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description, detailed_description: s.detailed_description || "", image_url: s.image_url || "", category: s.category, youtube_url: s.youtube_url || "", audio_url: s.audio_url || "" });
    setShowModal(true);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Prototype Screens</h2><p className="text-gray-500 text-sm mt-1">Manage app prototype screens</p></div>
        <button onClick={() => { setEditing(null); setForm({ title: "", description: "", detailed_description: "", image_url: "", category: "general", youtube_url: "", audio_url: "" }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
          +  Add Screen
        </button>
      </div>

      <div className="space-y-3">
        {screens.map((s, idx) => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <span className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => moveItem(s, "up")} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▲</button>
              <button onClick={() => moveItem(s, "down")} disabled={idx === screens.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▼</button>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {s.image_url ? <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 truncate">{s.title}</h3>
                {!s.published && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Draft</span>}
                {s.pinned && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Pinned</span>}
              </div>
              <p className="text-gray-400 text-xs mt-0.5">{s.category}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => togglePublished(s)} className={`p-2 rounded-lg ${s.published ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>{s.published ? "✓" : "○"}</button>
              <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
              <button onClick={() => deleteItem(s.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
            </div>
          </div>
        ))}
        {screens.length === 0 && <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><p className="text-gray-500">No screens yet.</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">{editing ? "Edit Screen" : "Add Screen"}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label><textarea value={form.detailed_description} onChange={(e) => setForm({ ...form, detailed_description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={3} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="home, emergency, response..." /></div>
              <MediaUploader label="Screenshot Image" type="image" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
              <MediaUploader label="YouTube Video" type="video" value={form.youtube_url} onChange={(url) => setForm({ ...form, youtube_url: url })} />
              <MediaUploader label="Audio Explanation" type="audio" value={form.audio_url} onChange={(url) => setForm({ ...form, audio_url: url })} />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2.5 text-gray-700 bg-gray-100 font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={save} disabled={!form.title} className="px-4 py-2.5 text-white font-medium rounded-xl disabled:opacity-50" style={{ background: "linear-gradient(135deg, #4f7cff, #7c5cfc)" }}>{editing ? "Save" : "Add Screen"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
