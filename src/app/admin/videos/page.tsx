"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
// Icons use emoji instead of lucide-react

interface Video {
  id: string;
  youtube_url: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  display_order: number;
  pinned: boolean;
  published: boolean;
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

export default function VideosAdmin() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState({ youtube_url: "", title: "", description: "", category: "general" });

  const fetchData = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data } = await sb.from("videos").select("*").order("display_order", { ascending: true });
      setVideos((data as Video[]) || []);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    try {
      const sb = getSupabaseClient();
      const videoId = extractYoutubeId(form.youtube_url);
      const thumbnail_url = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
      const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.display_order)) + 1 : 0;

      if (editing) {
        await sb.from("videos").update({
          youtube_url: form.youtube_url,
          title: form.title,
          description: form.description,
          category: form.category,
          thumbnail_url,
        }).eq("id", editing.id);
      } else {
        await sb.from("videos").insert({
          youtube_url: form.youtube_url,
          title: form.title,
          description: form.description,
          category: form.category,
          thumbnail_url,
          display_order: maxOrder,
          pinned: false,
          published: true,
        });
      }
      setShowModal(false);
      setEditing(null);
      setForm({ youtube_url: "", title: "", description: "", category: "general" });
      fetchData();
    } catch (err) {
      console.error("Failed to save video:", err);
      alert("Failed to save. Check console for details.");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    const sb = getSupabaseClient();
    await sb.from("videos").delete().eq("id", id);
    fetchData();
  };

  const moveItem = async (video: Video, direction: "up" | "down") => {
    const idx = videos.findIndex(v => v.id === video.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= videos.length) return;
    const sb = getSupabaseClient();
    const other = videos[swapIdx];
    const temp = video.display_order;
    await sb.from("videos").update({ display_order: other.display_order }).eq("id", video.id);
    await sb.from("videos").update({ display_order: temp }).eq("id", other.id);
    fetchData();
  };

  const openEdit = (video: Video) => {
    setEditing(video);
    setForm({ youtube_url: video.youtube_url, title: video.title, description: video.description, category: video.category });
    setShowModal(true);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">YouTube Videos</h2>
          <p className="text-gray-500 text-sm mt-1">Manage embedded YouTube videos</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ youtube_url: "", title: "", description: "", category: "general" }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
          +  Add Video
        </button>
      </div>

      <div className="space-y-3">
        {videos.map((video, idx) => {
          const videoId = extractYoutubeId(video.youtube_url);
          return (
            <div key={video.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <span className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => moveItem(video, "up")} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▲</button>
                <button onClick={() => moveItem(video, "down")} disabled={idx === videos.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▼</button>
              </div>
              <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {videoId ? (
                  <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No preview</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{video.title || "Untitled"}</h3>
                <p className="text-gray-400 text-xs mt-0.5 truncate">{video.youtube_url}</p>
                {video.category && <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{video.category}</span>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a href={video.youtube_url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><span className="w-4 h-4" /></a>
                <button onClick={() => openEdit(video)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                <button onClick={() => deleteItem(video.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
              </div>
            </div>
          );
        })}
        {videos.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No videos yet. Click &quot;Add Video&quot; to embed a YouTube video.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{editing ? "Edit Video" : "Add YouTube Video"}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL *</label>
                <input type="url" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://youtube.com/watch?v=..." />
                {form.youtube_url && extractYoutubeId(form.youtube_url) && (
                  <div className="mt-2 aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <iframe src={`https://www.youtube.com/embed/${extractYoutubeId(form.youtube_url)}`} className="w-full h-full" allowFullScreen title="Preview" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Video title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. demo, research, tutorial" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2.5 text-gray-700 bg-gray-100 font-medium rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={save} disabled={!form.youtube_url} className="px-4 py-2.5 text-white font-medium rounded-xl transition-colors disabled:opacity-50" style={{ background: "linear-gradient(135deg, #4f7cff, #7c5cfc)" }}>{editing ? "Save Changes" : "Add Video"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
