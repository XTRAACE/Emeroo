"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import MediaUploader from "@/components/admin/MediaUploader";
import GraphBuilder, { type GraphData } from "@/components/admin/GraphBuilder";

interface Survey {
  id: string; title: string; description: string; response: string;
  image_url: string | null; audio_url: string | null; youtube_url: string | null;
  category: string; published: boolean;
  document_url: string | null; graph_data: GraphData | null;
  documents: { url: string; name: string }[] | null;
  videos: { url: string; title: string }[] | null;
  audios: { url: string; label: string }[] | null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseJsonArray<T>(val: unknown): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { const p = JSON.parse(val as string); return Array.isArray(p) ? p : []; } catch { return []; }
}

export default function SurveysAdmin() {
  const [items, setItems] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", response: "", image_url: "", audio_url: "", youtube_url: "", category: "",
    document_url: "", graph_data: null as GraphData | null,
  });
  const [documents, setDocuments] = useState<{ url: string; name: string }[]>([]);
  const [videos, setVideos] = useState<{ url: string; title: string }[]>([]);
  const [audios, setAudios] = useState<{ url: string; label: string }[]>([]);
  const [docUploading, setDocUploading] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [saveError, setSaveError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data } = await sb.from("surveys").select("*").order("created_at", { ascending: false });
      setItems((data as Survey[]) || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setDocuments(prev => [...prev, { url: base64, name: file.name }]);
    } catch (err) { console.error("Document upload failed:", err); }
    setDocUploading(false);
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const addVideo = () => setVideos(prev => [...prev, { url: "", title: `Video ${prev.length + 1}` }]);
  const removeVideo = (idx: number) => setVideos(prev => prev.filter((_, i) => i !== idx));
  const updateVideo = (idx: number, field: "url" | "title", value: string) => {
    setVideos(prev => { const u = [...prev]; u[idx] = { ...u[idx], [field]: value }; return u; });
  };

  const addAudio = () => setAudios(prev => [...prev, { url: "", label: `Audio ${prev.length + 1}` }]);
  const removeAudio = (idx: number) => setAudios(prev => prev.filter((_, i) => i !== idx));
  const updateAudio = (idx: number, field: "url" | "label", value: string) => {
    setAudios(prev => { const u = [...prev]; u[idx] = { ...u[idx], [field]: value }; return u; });
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateAudio(idx, "url", base64);
    } catch (err) { console.error("Audio upload failed:", err); }
  };

  const save = async () => {
    setSaveError("");
    try {
      const sb = getSupabaseClient();
      const payload = {
        title: form.title, description: form.description, response: form.response,
        image_url: form.image_url || null, audio_url: form.audio_url || null, youtube_url: form.youtube_url || null,
        category: form.category, document_url: form.document_url || null,
        graph_data: form.graph_data || null,
        documents: documents.length > 0 ? JSON.stringify(documents) : null,
        videos: videos.length > 0 ? JSON.stringify(videos) : null,
        audios: audios.length > 0 ? JSON.stringify(audios) : null,
      };
      if (editing) {
        const { error } = await sb.from("surveys").update(payload).eq("id", editing.id);
        if (error) { setSaveError("Update failed: " + error.message); return; }
      } else {
        const { error } = await sb.from("surveys").insert({ ...payload, published: true });
        if (error) { setSaveError("Insert failed: " + error.message); return; }
      }
      setShowModal(false); setEditing(null); setSaveError("");
      resetForm();
      fetchData();
    } catch (err) { setSaveError("Error: " + (err as Error).message); }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", response: "", image_url: "", audio_url: "", youtube_url: "", category: "", document_url: "", graph_data: null });
    setDocuments([]); setVideos([]); setAudios([]);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete?")) return;
    const sb = getSupabaseClient();
    await sb.from("surveys").delete().eq("id", id);
    fetchData();
  };

  const openEdit = (item: Survey) => {
    setEditing(item);
    setForm({
      title: item.title, description: item.description, response: item.response,
      image_url: item.image_url || "", audio_url: item.audio_url || "", youtube_url: item.youtube_url || "",
      category: item.category, document_url: item.document_url || "", graph_data: item.graph_data || null,
    });
    setDocuments(parseJsonArray(item.documents));
    setVideos(parseJsonArray(item.videos));
    setAudios(parseJsonArray(item.audios));
    setShowModal(true);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Surveys</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{items.length} surveys — add PDFs, audio, videos, and graphs</p>
        </div>
        <button onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-white font-medium rounded-xl"
          style={{ background: "var(--gradient-primary)" }}>+ Add Survey</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{item.description}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {item.document_url && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent-primary)" }}>📄 Document</span>}
                {parseJsonArray(item.documents).length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent-primary)" }}>📄 {parseJsonArray(item.documents).length} docs</span>}
                {parseJsonArray(item.audios).length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>🎵 {parseJsonArray(item.audios).length} audio</span>}
                {parseJsonArray(item.videos).length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>🎬 {parseJsonArray(item.videos).length} videos</span>}
                {item.graph_data && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(234,88,12,0.1)", color: "#ea580c" }}>📊 Graph</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEdit(item)} className="p-2 rounded-lg" style={{ color: "var(--text-muted)" }}>✏️</button>
              <button onClick={() => deleteItem(item.id)} className="p-2 rounded-lg" style={{ color: "#ef4444" }}>🗑️</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="card p-12 text-center"><p style={{ color: "var(--text-muted)" }}>No surveys yet.</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{ background: "var(--bg-card)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-color)" }}>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{editing ? "Edit Survey" : "Add Survey"}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {saveError && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>{saveError}</div>}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} rows={2} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Response / Data</label>
                <textarea value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} rows={4}
                  placeholder="Survey responses, findings, data points..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                  placeholder="e.g. user-research, market-analysis" />
              </div>

              {/* Survey Image */}
              <MediaUploader label="Survey Image" type="image" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />

              {/* PDF/DOCX Document Upload */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span>📄</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Documents (PDF, DOCX)</span>
                    {documents.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>✓ {documents.length} file{documents.length > 1 ? "s" : ""}</span>}
                  </div>

                  {/* Existing documents */}
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--bg-primary)" }}>
                          <span>📄</span>
                          <span className="flex-1 text-xs truncate" style={{ color: "var(--text-primary)" }}>{doc.name}</span>
                          <button onClick={() => setDocuments(prev => prev.filter((_, i) => i !== idx))} className="text-xs" style={{ color: "#ef4444" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* URL paste */}
                  <input type="url" value={form.document_url} onChange={(e) => setForm({ ...form, document_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                    placeholder="Or paste document URL..." />

                  {/* File upload */}
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
                      style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
                      {docUploading ? "⏳ Uploading..." : "📁 Upload PDF / DOCX"}
                      <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" className="hidden" onChange={handleDocUpload} disabled={docUploading} />
                    </label>
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Supports: PDF, DOCX, PPTX, XLSX — file is saved directly in database</p>
                </div>
              </div>

              {/* Multiple Audio */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>🎵</span>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Audio Recordings ({audios.length})</span>
                    </div>
                    <button onClick={addAudio} className="text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>+ Add Audio</button>
                  </div>
                  {audios.map((audio, idx) => (
                    <div key={idx} className="p-3 rounded-xl space-y-2" style={{ background: "var(--bg-primary)" }}>
                      <div className="flex items-center gap-2">
                        <input type="text" value={audio.label} onChange={(e) => updateAudio(idx, "url", e.target.value)}
                          className="flex-1 px-2 py-1.5 text-xs rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
                          style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                          placeholder="Label" />
                        <button onClick={() => removeAudio(idx)} className="text-xs" style={{ color: "#ef4444" }}>✕</button>
                      </div>
                      {audio.url && <audio controls src={audio.url} className="w-full" style={{ height: "32px" }} />}
                      <div className="flex items-center gap-2">
                        <input type="url" value={audio.url.startsWith("data:") ? "" : audio.url}
                          onChange={(e) => updateAudio(idx, "url", e.target.value)}
                          className="flex-1 px-2 py-1.5 text-xs rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
                          style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                          placeholder="Paste audio URL" />
                        <label className="text-xs font-medium px-2 py-1.5 rounded-lg cursor-pointer whitespace-nowrap"
                          style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent-primary)" }}>
                          📤 Upload
                          <input type="file" accept="audio/*,.aac,.m4a,.mp3,.wav,.ogg,.flac" className="hidden" onChange={(e) => handleAudioUpload(e, idx)} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multiple Videos */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>🎬</span>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Videos ({videos.length})</span>
                    </div>
                    <button onClick={addVideo} className="text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>+ Add Video</button>
                  </div>
                  {videos.map((video, idx) => (
                    <div key={idx} className="p-3 rounded-xl space-y-2" style={{ background: "var(--bg-primary)" }}>
                      <div className="flex items-center gap-2">
                        <input type="text" value={video.title} onChange={(e) => updateVideo(idx, "title", e.target.value)}
                          className="flex-1 px-2 py-1.5 text-xs rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
                          style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                          placeholder="Video title" />
                        <button onClick={() => removeVideo(idx)} className="text-xs" style={{ color: "#ef4444" }}>✕</button>
                      </div>
                      <input type="url" value={video.url} onChange={(e) => updateVideo(idx, "url", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
                        style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                        placeholder="YouTube URL or video URL" />
                      {video.url && video.url.includes("youtube") && (
                        <div className="rounded-lg overflow-hidden">
                          <div className="aspect-video">
                            <iframe src={`https://www.youtube.com/embed/${video.url.match(/(?:v=)([^&?/]+)/)?.[1] || ""}`}
                              className="w-full h-full" allowFullScreen title={video.title} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Data */}
              <MediaUploader label="Single Audio" type="audio" value={form.audio_url} onChange={(url) => setForm({ ...form, audio_url: url })} />

              {/* Graph Builder */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>📊</span>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Graph / Chart</span>
                      {form.graph_data && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>✓ Configured</span>}
                    </div>
                    {form.graph_data && (
                      <button onClick={() => setForm({ ...form, graph_data: null })} className="text-xs" style={{ color: "#ef4444" }}>Remove graph</button>
                    )}
                  </div>
                  {!form.graph_data ? (
                    <button onClick={() => setForm({ ...form, graph_data: { chart_type: "bar", title: "Survey Results", labels: ["Yes", "No", "Maybe"], values: [60, 25, 15], colors: ["#dc2626", "#ea580c", "#f59e0b"] } })}
                      className="w-full p-4 rounded-xl text-center text-sm"
                      style={{ border: "2px dashed var(--border-color)", color: "var(--text-muted)" }}>
                      + Click to add a chart/graph
                    </button>
                  ) : (
                    <GraphBuilder data={form.graph_data} onChange={(d) => setForm({ ...form, graph_data: d })} />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border-color)" }}>
              <button onClick={() => { setShowModal(false); setEditing(null); setSaveError(""); }} className="px-4 py-2.5 font-medium rounded-xl"
                style={{ color: "var(--text-secondary)", background: "var(--bg-primary)" }}>Cancel</button>
              <button onClick={save} disabled={!form.title} className="px-4 py-2.5 text-white font-medium rounded-xl disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}>{editing ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
