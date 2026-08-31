"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
// Icons use emoji instead of lucide-react

interface FeedbackItem {
  id: string; person_name: string; photo_url: string | null; role: string;
  description: string; feedback_text: string; audio_url: string | null;
  youtube_url: string | null; display_order: number; published: boolean; category: string;
}

interface AudioEntry {
  url: string;
  label: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(file); });
}

function parseAudioArray(audioUrl: string | null): AudioEntry[] {
  if (!audioUrl) return [];
  try {
    const parsed = JSON.parse(audioUrl);
    if (Array.isArray(parsed)) return parsed;
    // Legacy single URL
    return [{ url: audioUrl, label: "Audio" }];
  } catch {
    // Legacy single URL (not JSON)
    return [{ url: audioUrl, label: "Audio" }];
  }
}

function serializeAudioArray(audios: AudioEntry[]): string | null {
  if (audios.length === 0) return null;
  return JSON.stringify(audios);
}

export default function FeedbackAdmin() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FeedbackItem | null>(null);
  const [form, setForm] = useState({ person_name: "", photo_url: "", role: "", description: "", feedback_text: "", youtube_url: "", category: "" });
  const [audios, setAudios] = useState<AudioEntry[]>([]);
  const [saveError, setSaveError] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const audioInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data, error } = await sb.from("feedback").select("*").order("display_order", { ascending: true });
      if (error) console.error("Feedback fetch error:", error.message);
      setItems((data as FeedbackItem[]) || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const base64 = await fileToBase64(file);
      setAudios(prev => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], url: base64 };
        return updated;
      });
    } catch (err) { console.error("Audio upload failed:", err); }
    setUploadingIdx(null);
    if (audioInputRefs.current[idx]) audioInputRefs.current[idx]!.value = "";
  };

  const addAudio = () => {
    setAudios(prev => [...prev, { url: "", label: `Audio ${prev.length + 1}` }]);
  };

  const removeAudio = (idx: number) => {
    setAudios(prev => prev.filter((_, i) => i !== idx));
  };

  const updateAudioLabel = (idx: number, label: string) => {
    setAudios(prev => { const updated = [...prev]; updated[idx] = { ...updated[idx], label }; return updated; });
  };

  const updateAudioUrl = (idx: number, url: string) => {
    setAudios(prev => { const updated = [...prev]; updated[idx] = { ...updated[idx], url }; return updated; });
  };

  const moveAudio = (idx: number, dir: "up" | "down") => {
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= audios.length) return;
    setAudios(prev => {
      const updated = [...prev];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      return updated;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try { const base64 = await fileToBase64(file); setForm(prev => ({ ...prev, photo_url: base64 })); }
    catch (err) { console.error("Photo upload failed:", err); }
    setPhotoUploading(false);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const save = async () => {
    setSaveError("");
    try {
      const sb = getSupabaseClient();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { setSaveError("Not logged in. Please sign in again."); return; }

      const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 0;
      const payload = {
        person_name: form.person_name, photo_url: form.photo_url || null, role: form.role,
        description: form.description, feedback_text: form.feedback_text || "No detailed feedback",
        audio_url: serializeAudioArray(audios), youtube_url: form.youtube_url || null, category: form.category,
      };

      if (editing) {
        const { error } = await sb.from("feedback").update(payload).eq("id", editing.id);
        if (error) { setSaveError("Update failed: " + error.message); return; }
      } else {
        const { error } = await sb.from("feedback").insert({ ...payload, display_order: maxOrder, published: true });
        if (error) { setSaveError("Insert failed: " + error.message); return; }
      }
      setShowModal(false); setEditing(null); setSaveError("");
      setForm({ person_name: "", photo_url: "", role: "", description: "", feedback_text: "", youtube_url: "", category: "" });
      setAudios([]);
      fetchData();
    } catch (err) { setSaveError("Error: " + (err as Error).message); }
  };

  const deleteItem = async (id: string) => { if (!confirm("Delete?")) return; const sb = getSupabaseClient(); await sb.from("feedback").delete().eq("id", id); fetchData(); };

  const moveItem = async (item: FeedbackItem, dir: "up" | "down") => {
    const idx = items.findIndex(i => i.id === item.id); const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return; const sb = getSupabaseClient(); const other = items[swapIdx]; const temp = item.display_order;
    await sb.from("feedback").update({ display_order: other.display_order }).eq("id", item.id);
    await sb.from("feedback").update({ display_order: temp }).eq("id", other.id); fetchData();
  };

  const openEdit = (item: FeedbackItem) => {
    setEditing(item);
    setForm({ person_name: item.person_name, photo_url: item.photo_url || "", role: item.role, description: item.description, feedback_text: item.feedback_text, youtube_url: item.youtube_url || "", category: item.category || "" });
    setAudios(parseAudioArray(item.audio_url));
    setShowModal(true);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Feedback</h2><p className="text-gray-500 text-sm mt-1">{items.length} feedback entries</p></div>
        <button onClick={() => { setEditing(null); setSaveError(""); setForm({ person_name: "", photo_url: "", role: "", description: "", feedback_text: "", youtube_url: "", category: "" }); setAudios([]); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">+  Add Feedback</button>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const audioCount = parseAudioArray(item.audio_url).length;
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => moveItem(item, "up")} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▲</button>
                <button onClick={() => moveItem(item, "down")} disabled={idx === items.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▼</button>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400 font-bold text-sm">
                {item.photo_url ? <img src={item.photo_url} alt="" className="w-full h-full object-cover" /> : item.person_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{item.person_name}</h3>
                <p className="text-gray-400 text-xs truncate">{item.description || item.feedback_text?.slice(0, 60)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {audioCount > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🎵 {audioCount} audio{audioCount > 1 ? "s" : ""}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><p className="text-gray-500">No feedback yet.</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">{editing ? "Edit Feedback" : "Add Feedback"}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); setSaveError(""); }} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {saveError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{saveError}</div>}

              <div><label className="block text-sm font-medium text-gray-700 mb-1">Person Name *</label><input type="text" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label><input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Student, Developer" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Short Quote</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Feedback</label><textarea value={form.feedback_text} onChange={(e) => setForm({ ...form, feedback_text: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={4} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="student, mentor, user..." /></div>

              {/* Profile Photo */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {form.photo_url ? <img src={form.photo_url} alt="Photo" className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xl font-bold">{form.person_name?.charAt(0) || "?"}</span>}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input type="url" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Or paste image URL" />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 cursor-pointer">
                      📤 {photoUploading ? "Uploading..." : "Upload from computer"}
                      <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Multiple Audio Recordings */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">🎵 Audio Recordings ({audios.length})</label>
                  <button type="button" onClick={addAudio} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors">
                    ➕ Add Audio
                  </button>
                </div>

                {audios.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">No audio files yet. Click &quot;Add Audio&quot; to upload.</p>
                )}

                {audios.map((audio, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 text-gray-300 flex-shrink-0" />
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={() => moveAudio(idx, "up")} disabled={idx === 0} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30">▲</button>
                        <button type="button" onClick={() => moveAudio(idx, "down")} disabled={idx === audios.length - 1} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30">▼</button>
                      </div>
                      <input type="text" value={audio.label} onChange={(e) => updateAudioLabel(idx, e.target.value)} className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" placeholder="Audio label (e.g. Voice Feedback)" />
                      <button type="button" onClick={() => removeAudio(idx)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">🗑️</button>
                    </div>

                    {audio.url && (
                      <div className="rounded-lg bg-white p-2">
                        <audio controls src={audio.url} className="w-full" style={{ height: "36px" }} />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input type="url" value={audio.url.startsWith("data:") ? "" : audio.url} onChange={(e) => updateAudioUrl(idx, e.target.value)} className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white" placeholder="Paste audio URL" />
                      <label className="inline-flex items-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 cursor-pointer whitespace-nowrap">
                        📤 {uploadingIdx === idx ? "..." : "Upload"}
                        <input ref={(el) => { audioInputRefs.current[idx] = el; }} type="file" accept="audio/*,.aac,.m4a,.mp3,.wav,.ogg,.flac,.wma,.opus" onChange={(e) => handleAudioUpload(e, idx)} className="hidden" />
                      </label>
                    </div>
                  </div>
                ))}

                {audios.length > 0 && (
                  <p className="text-xs text-gray-400">Supports: AAC, MP3, WAV, OGG, M4A, FLAC, OPUS. Drag ⠿ to reorder. Each audio gets its own label and player.</p>
                )}
              </div>

              {/* YouTube Video */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">YouTube Video (optional)</label>
                <input type="url" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="https://youtube.com/watch?v=..." />
                {form.youtube_url && form.youtube_url.includes("youtube") && (
                  <div className="rounded-xl overflow-hidden bg-gray-900"><div className="aspect-video"><iframe src={`https://www.youtube.com/embed/${form.youtube_url.match(/(?:v=)([^&?/]+)/)?.[1] || ""}`} className="w-full h-full" allowFullScreen title="Preview" /></div></div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowModal(false); setEditing(null); setSaveError(""); }} className="px-4 py-2.5 text-gray-700 bg-gray-100 font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={save} disabled={!form.person_name} className="px-4 py-2.5 text-white font-medium rounded-xl disabled:opacity-50" style={{ background: "linear-gradient(135deg, #4f7cff, #7c5cfc)" }}>{editing ? "Save Changes" : "Add Feedback"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
