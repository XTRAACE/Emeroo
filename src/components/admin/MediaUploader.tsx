"use client";

import { useState, useRef } from "react";

interface MediaUploaderProps {
  label: string;
  type: "image" | "video" | "audio" | "all";
  value: string;
  onChange: (url: string) => void;
  preview?: boolean;
  required?: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MediaUploader({ label, type, value, onChange, preview = true, required = false }: MediaUploaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pasteUrl, setPasteUrl] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setUploading(true);
      try { const base64 = await fileToBase64(files[0]); onChange(base64); setPasteUrl(base64); }
      catch (err) { console.error("Failed to convert file:", err); }
      setUploading(false);
      return;
    }
    const droppedText = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/uri-list");
    if (droppedText) { onChange(droppedText.trim()); setPasteUrl(droppedText.trim()); }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const base64 = await fileToBase64(file); onChange(base64); setPasteUrl(base64); }
    catch (err) { console.error("Failed to convert file:", err); alert("Failed to process file."); }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const getIcon = () => {
    switch (type) {
      case "image": return "🖼️";
      case "video": return "🎬";
      case "audio": return "🎵";
      default: return "📁";
    }
  };

  const getAccept = () => {
    switch (type) {
      case "image": return "image/*";
      case "video": return "video/*,image/*";
      case "audio": return "audio/*,.aac,.m4a,.mp3,.wav,.ogg,.flac,.wma,.opus";
      default: return "image/*,video/*,audio/*";
    }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
      <button type="button" onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{ background: "var(--bg-primary)" }}>
        <div className="flex items-center gap-2">
          <span>{getIcon()}</span>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
          {required && <span className="text-red-500 text-xs">*</span>}
          {value && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>✓ Added</span>}
        </div>
        <span style={{ color: "var(--text-muted)" }}>{isExpanded ? "▲" : "▼"}</span>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Paste URL</label>
            <input type="url" value={pasteUrl.startsWith("data:") ? "(Uploaded file)" : pasteUrl}
              onChange={(e) => { setPasteUrl(e.target.value); onChange(e.target.value); }}
              className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
              placeholder={`Paste ${type} URL here...`} disabled={uploading} />
          </div>

          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            style={{
              borderColor: dragOver ? "var(--accent-primary)" : "var(--border-color)",
              background: dragOver ? "rgba(220,38,38,0.03)" : "transparent",
            }}>
            {uploading ? (
              <><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm" style={{ color: "var(--accent-primary)" }}>Uploading...</p></>
            ) : (
              <><span className="text-3xl block mb-2">📤</span>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{dragOver ? "Drop here" : "Drag & drop or click to browse"}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Files are saved directly — works even after refresh</p></>
            )}
          </div>
          <input ref={inputRef} type="file" accept={getAccept()} onChange={handleFileSelect} className="hidden" />

          {preview && value && (
            <div className="relative rounded-xl overflow-hidden" style={{ background: "var(--bg-primary)" }}>
              {type === "image" && <img src={value} alt="Preview" className="w-full h-32 object-contain" />}
              {type === "video" && (
                <div className="aspect-video">
                  {value.includes("youtube") || value.includes("youtu.be") ? (
                    <iframe src={`https://www.youtube.com/embed/${value.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] || ""}`} className="w-full h-full" allowFullScreen title="Preview" />
                  ) : (
                    <video src={value} className="w-full h-full object-contain" controls />
                  )}
                </div>
              )}
              {type === "audio" && <div className="p-3"><audio controls src={value} className="w-full" /></div>}
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(""); setPasteUrl(""); }}
                className="absolute top-2 right-2 p-1.5 rounded-full text-red-500 shadow-sm"
                style={{ background: "rgba(255,255,255,0.9)" }}>✕</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
