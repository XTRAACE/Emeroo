"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Section {
  id: string; title: string; slug: string; section_type: string; content: Record<string, unknown>;
  display_order: number; pinned: boolean; published: boolean; show_in_navbar: boolean;
  navbar_label: string; navbar_order: number; navbar_enabled: boolean; navbar_important: boolean;
}

interface ContentBlock {
  id: string; section_id: string; block_type: string; content: Record<string, unknown>;
  media_url: string | null; youtube_url: string | null; display_order: number;
  width: string; alignment: string; published: boolean;
}

const blockTypes = [
  { value: "heading", label: "Heading", icon: "H" },
  { value: "paragraph", label: "Paragraph", icon: "¶" },
  { value: "image", label: "Image", icon: "🖼" },
  { value: "youtube_video", label: "YouTube Video", icon: "▶" },
  { value: "button", label: "Button", icon: "🔗" },
  { value: "card", label: "Card", icon: "□" },
  { value: "quote", label: "Quote", icon: "❝" },
];

export default function SectionsAdmin() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Record<string, ContentBlock[]>>({});
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", section_type: "custom", show_in_navbar: false, navbar_label: "" });

  const fetchSections = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data, error } = await sb.from("sections").select("*").order("display_order", { ascending: true });
      if (error) console.error("Sections fetch error:", error.message);
      setSections((data as Section[]) || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const fetchBlocks = async (sectionId: string) => {
    try {
      const sb = getSupabaseClient();
      const { data, error } = await sb.from("content_blocks").select("*").eq("section_id", sectionId).order("display_order", { ascending: true });
      if (error) console.error("Blocks fetch error:", error.message);
      setBlocks((prev) => ({ ...prev, [sectionId]: (data as ContentBlock[]) || [] }));
    } catch (err) { console.error(err); }
  };

  const saveSection = async () => {
    try {
      const sb = getSupabaseClient();
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) + 1 : 0;

      if (editingSection) {
        const { error } = await sb.from("sections").update({ title: form.title, slug, section_type: form.section_type, show_in_navbar: form.show_in_navbar, navbar_label: form.navbar_label || form.title }).eq("id", editingSection.id);
        if (error) { alert("Error: " + error.message); return; }
      } else {
        const { error } = await sb.from("sections").insert({ title: form.title, slug, section_type: form.section_type, content: {}, display_order: maxOrder, published: true, pinned: false, show_in_navbar: form.show_in_navbar, navbar_label: form.navbar_label || form.title, navbar_order: maxOrder, navbar_enabled: form.show_in_navbar, navbar_important: false });
        if (error) { alert("Error: " + error.message); return; }
      }
      setShowModal(false); setEditingSection(null);
      setForm({ title: "", slug: "", section_type: "custom", show_in_navbar: false, navbar_label: "" });
      fetchSections();
    } catch (err) { console.error(err); alert("Failed: " + (err as Error).message); }
  };

  const togglePublished = async (section: Section) => {
    const sb = getSupabaseClient();
    await sb.from("sections").update({ published: !section.published }).eq("id", section.id);
    fetchSections();
  };

  const togglePinned = async (section: Section) => {
    const sb = getSupabaseClient();
    await sb.from("sections").update({ pinned: !section.pinned }).eq("id", section.id);
    fetchSections();
  };

  const toggleNavbar = async (section: Section) => {
    const sb = getSupabaseClient();
    await sb.from("sections").update({ show_in_navbar: !section.show_in_navbar, navbar_enabled: !section.show_in_navbar }).eq("id", section.id);
    fetchSections();
  };

  const moveSection = async (section: Section, direction: "up" | "down") => {
    const idx = sections.findIndex(s => s.id === section.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sections.length) return;
    const sb = getSupabaseClient();
    const other = sections[swapIdx];
    const tempOrder = section.display_order;
    await sb.from("sections").update({ display_order: other.display_order }).eq("id", section.id);
    await sb.from("sections").update({ display_order: tempOrder }).eq("id", other.id);
    fetchSections();
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Delete this section and all its content blocks?")) return;
    const sb = getSupabaseClient();
    await sb.from("content_blocks").delete().eq("section_id", id);
    await sb.from("sections").delete().eq("id", id);
    fetchSections();
  };

  const openEditModal = (section: Section) => {
    setEditingSection(section);
    setForm({ title: section.title, slug: section.slug, section_type: section.section_type, show_in_navbar: section.show_in_navbar, navbar_label: section.navbar_label || "" });
    setShowModal(true);
  };

  const toggleExpand = (sectionId: string) => {
    if (expandedSection === sectionId) { setExpandedSection(null); }
    else { setExpandedSection(sectionId); if (!blocks[sectionId]) fetchBlocks(sectionId); }
  };

  const addBlock = async (sectionId: string, type: string = "paragraph") => {
    const sb = getSupabaseClient();
    const existingBlocks = blocks[sectionId] || [];
    const maxOrder = existingBlocks.length > 0 ? Math.max(...existingBlocks.map(b => b.display_order)) + 1 : 0;
    const defaultContent: Record<string, string> = {};
    if (type === "heading") defaultContent.text = "New Heading";
    else if (type === "paragraph") defaultContent.text = "Write your paragraph here...";
    else if (type === "button") { defaultContent.text = "Click me"; defaultContent.href = "#"; }
    else if (type === "card") { defaultContent.icon = "🚨"; defaultContent.title = "Card Title"; defaultContent.text = "Card description"; }
    else if (type === "quote") { defaultContent.text = "Quote text"; defaultContent.author = "Author"; }

    const { error } = await sb.from("content_blocks").insert({
      section_id: sectionId, block_type: type, content: defaultContent,
      display_order: maxOrder, width: "full", alignment: "left", padding: "default", published: true,
    });
    if (error) console.error("Add block error:", error.message);
    fetchBlocks(sectionId);
  };

  const saveBlock = async (block: ContentBlock) => {
    const sb = getSupabaseClient();
    const { error } = await sb.from("content_blocks").update({
      block_type: block.block_type, content: block.content, media_url: block.media_url,
      youtube_url: block.youtube_url, alignment: block.alignment, width: block.width,
    }).eq("id", block.id);
    if (error) console.error("Save block error:", error.message);
    setEditingBlock(null);
    fetchBlocks(block.section_id);
  };

  const deleteBlock = async (block: ContentBlock) => {
    if (!confirm("Delete this content block?")) return;
    const sb = getSupabaseClient();
    await sb.from("content_blocks").delete().eq("id", block.id);
    fetchBlocks(block.section_id);
  };

  const moveBlock = async (block: ContentBlock, blocksList: ContentBlock[], direction: "up" | "down") => {
    const idx = blocksList.findIndex(b => b.id === block.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= blocksList.length) return;
    const sb = getSupabaseClient();
    const other = blocksList[swapIdx];
    const tempOrder = block.display_order;
    await sb.from("content_blocks").update({ display_order: other.display_order }).eq("id", block.id);
    await sb.from("content_blocks").update({ display_order: tempOrder }).eq("id", other.id);
    fetchBlocks(block.section_id);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Sections</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{sections.length} sections — click to expand and edit content blocks</p>
        </div>
        <button onClick={() => { setEditingSection(null); setForm({ title: "", slug: "", section_type: "custom", show_in_navbar: false, navbar_label: "" }); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-white font-medium rounded-xl"
          style={{ background: "var(--gradient-primary)" }}>
          + Add Section
        </button>
      </div>

      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div key={section.id} className="card overflow-hidden" style={{ padding: 0 }}>
            <div className="p-4 flex items-center gap-3">
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => moveSection(section, "up")} disabled={idx === 0} className="p-1 rounded disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>▲</button>
                <button onClick={() => moveSection(section, "down")} disabled={idx === sections.length - 1} className="p-1 rounded disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>▼</button>
              </div>
              <button onClick={() => toggleExpand(section.id)} className="p-1 rounded" style={{ color: "var(--text-secondary)" }}>
                {expandedSection === section.id ? "▼" : "▶"}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{section.title}</h3>
                  {!section.published && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(234,179,8,0.1)", color: "#ca8a04" }}>Draft</span>}
                  {section.pinned && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>Pinned</span>}
                  {section.show_in_navbar && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent-primary)" }}>Navbar</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => togglePublished(section)} className="p-2 rounded-lg" title={section.published ? "Published" : "Draft"}
                  style={{ color: section.published ? "#16a34a" : "var(--text-muted)" }}>
                  {section.published ? "Published" : "Draft"}
                </button>
                <button onClick={() => togglePinned(section)} className="p-2 rounded-lg" title="Pin"
                  style={{ color: section.pinned ? "#7c3aed" : "var(--text-muted)" }}>
                  {section.pinned ? "📌" : "📍"}
                </button>
                <button onClick={() => toggleNavbar(section)} className="p-2 rounded-lg" title="Toggle Navbar"
                  style={{ color: section.show_in_navbar ? "var(--accent-primary)" : "var(--text-muted)" }}>
                  🔗
                </button>
                <button onClick={() => openEditModal(section)} className="p-2 rounded-lg" title="Edit"
                  style={{ color: "var(--text-muted)" }}>✏️</button>
                <button onClick={() => deleteSection(section.id)} className="p-2 rounded-lg" title="Delete"
                  style={{ color: "#ef4444" }}>🗑️</button>
              </div>
            </div>

            {expandedSection === section.id && (
              <div className="border-t p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)" }}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h4 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Content Blocks ({(blocks[section.id] || []).length})</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {blockTypes.map(bt => (
                      <button key={bt.value} onClick={() => addBlock(section.id, bt.value)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg"
                        style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
                        <span>{bt.icon}</span> {bt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {(blocks[section.id] || []).map((block, bIdx) => (
                    <div key={block.id} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                      {editingBlock?.id === block.id ? (
                        <BlockEditor block={block} onSave={saveBlock} onCancel={() => setEditingBlock(null)} />
                      ) : (
                        <div className="flex items-center gap-3 p-3">
                          <span className="text-gray-300 flex-shrink-0 cursor-grab">⠿</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => moveBlock(block, blocks[section.id] || [], "up")} disabled={bIdx === 0} className="p-0.5 rounded disabled:opacity-30 text-xs">▲</button>
                            <button onClick={() => moveBlock(block, blocks[section.id] || [], "down")} disabled={bIdx === (blocks[section.id] || []).length - 1} className="p-0.5 rounded disabled:opacity-30 text-xs">▼</button>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded font-medium flex-shrink-0"
                            style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                            {blockTypes.find(bt => bt.value === block.block_type)?.icon} {block.block_type}
                          </span>
                          <div className="flex-1 min-w-0">
                            {block.block_type === "heading" && <span className="text-sm font-bold truncate block" style={{ color: "var(--text-primary)" }}>{(block.content as Record<string, string>)?.text || "Empty heading"}</span>}
                            {block.block_type === "paragraph" && <span className="text-sm truncate block" style={{ color: "var(--text-secondary)" }}>{(block.content as Record<string, string>)?.text?.slice(0, 80) || "Empty paragraph"}</span>}
                            {block.block_type === "youtube_video" && <span className="text-sm truncate block" style={{ color: "#ef4444" }}>▶ {block.youtube_url || "No URL set"}</span>}
                            {block.block_type === "image" && <span className="text-sm truncate block" style={{ color: "var(--text-secondary)" }}>{block.media_url ? "🖼 Image uploaded" : "No image set"}</span>}
                          </div>
                          <button onClick={() => setEditingBlock(block)} className="p-1.5 rounded-lg flex-shrink-0" style={{ color: "var(--text-muted)" }}>✏️</button>
                          <button onClick={() => deleteBlock(block)} className="p-1.5 rounded-lg flex-shrink-0" style={{ color: "#ef4444" }}>🗑️</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!blocks[section.id] || blocks[section.id].length === 0) && <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>No content blocks yet. Click a block type above to add one.</p>}
                </div>
              </div>
            )}
          </div>
        ))}
        {sections.length === 0 && <div className="card p-12 text-center"><p style={{ color: "var(--text-muted)" }}>No sections yet. Click &quot;Add Section&quot; to create your first section.</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-lg p-6" style={{ background: "var(--bg-card)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{editingSection ? "Edit Section" : "Create Section"}</h3>
              <button onClick={() => { setShowModal(false); setEditingSection(null); }} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                  placeholder="e.g. Emergency Response System" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                  placeholder="auto-generated from title" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="show_in_navbar" checked={form.show_in_navbar} onChange={(e) => setForm({ ...form, show_in_navbar: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="show_in_navbar" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Show in Navbar</label>
              </div>
              {form.show_in_navbar && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Navbar Label</label>
                  <input type="text" value={form.navbar_label} onChange={(e) => setForm({ ...form, navbar_label: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                    placeholder="Short label for navbar" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditingSection(null); }} className="px-4 py-2.5 font-medium rounded-xl"
                style={{ color: "var(--text-secondary)", background: "var(--bg-primary)" }}>Cancel</button>
              <button onClick={saveSection} disabled={!form.title} className="px-4 py-2.5 text-white font-medium rounded-xl disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}>{editingSection ? "Save Changes" : "Create Section"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockEditor({ block, onSave, onCancel }: { block: ContentBlock; onSave: (b: ContentBlock) => void; onCancel: () => void }) {
  const [localBlock, setLocalBlock] = useState<ContentBlock>({ ...block });
  const content = localBlock.content as Record<string, string>;

  const updateContent = (key: string, value: string) => {
    setLocalBlock({ ...localBlock, content: { ...localBlock.content, [key]: value } });
  };

  const extractYoutubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="p-4 space-y-4" style={{ background: "rgba(220,38,38,0.03)" }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Type:</span>
        {blockTypes.map(bt => (
          <button key={bt.value} onClick={() => setLocalBlock({ ...localBlock, block_type: bt.value })}
            className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors`}
            style={{
              background: localBlock.block_type === bt.value ? "var(--accent-primary)" : "var(--bg-card)",
              color: localBlock.block_type === bt.value ? "#ffffff" : "var(--text-secondary)",
              border: localBlock.block_type === bt.value ? "none" : "1px solid var(--border-color)",
            }}>
            {bt.icon} {bt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <select value={localBlock.alignment || "left"} onChange={(e) => setLocalBlock({ ...localBlock, alignment: e.target.value })}
          className="px-2 py-1 rounded-lg text-xs" style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
          <option value="left">← Left</option><option value="center">↔ Center</option><option value="right">→ Right</option>
        </select>
        <select value={localBlock.width || "full"} onChange={(e) => setLocalBlock({ ...localBlock, width: e.target.value })}
          className="px-2 py-1 rounded-lg text-xs" style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
          <option value="full">Full width</option><option value="half">Half width</option><option value="third">Third width</option>
        </select>
      </div>

      {localBlock.block_type === "heading" && (
        <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Heading Text</label>
        <input type="text" value={content.text || ""} onChange={(e) => updateContent("text", e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
          style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }} /></div>
      )}

      {localBlock.block_type === "paragraph" && (
        <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Paragraph Text</label>
        <textarea value={content.text || ""} onChange={(e) => updateContent("text", e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
          rows={4} placeholder="Write your paragraph here..." /></div>
      )}

      {localBlock.block_type === "youtube_video" && (
        <div className="space-y-2">
          <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>YouTube URL</label>
          <input type="url" value={localBlock.youtube_url || ""} onChange={(e) => setLocalBlock({ ...localBlock, youtube_url: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
            placeholder="https://youtube.com/watch?v=..." /></div>
          {localBlock.youtube_url && extractYoutubeId(localBlock.youtube_url) && (
            <div className="rounded-xl overflow-hidden bg-gray-900">
              <div className="aspect-video"><iframe src={`https://www.youtube.com/embed/${extractYoutubeId(localBlock.youtube_url)}`} className="w-full h-full" allowFullScreen title="YouTube Preview" /></div>
            </div>
          )}
        </div>
      )}

      {localBlock.block_type === "image" && (
        <div className="space-y-2">
          <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Image URL</label>
          <input type="url" value={localBlock.media_url || ""} onChange={(e) => setLocalBlock({ ...localBlock, media_url: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
            placeholder="https://..." /></div>
          {localBlock.media_url && <div className="rounded-xl overflow-hidden"><img src={localBlock.media_url} alt="Preview" className="w-full h-40 object-contain" /></div>}
        </div>
      )}

      {localBlock.block_type === "card" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Icon (emoji)</label>
            <input type="text" value={content.icon || ""} onChange={(e) => updateContent("icon", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }} placeholder="🚨" /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Card Title</label>
            <input type="text" value={content.title || ""} onChange={(e) => updateContent("title", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }} /></div>
          </div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Card Text</label>
          <textarea value={content.text || ""} onChange={(e) => updateContent("text", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }} rows={2} /></div>
        </div>
      )}

      {localBlock.block_type === "quote" && (
        <div className="space-y-2">
          <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Quote Text</label>
          <textarea value={content.text || ""} onChange={(e) => updateContent("text", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm italic focus:ring-2 focus:ring-red-500 focus:outline-none"
            style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }} rows={3} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Author</label>
          <input type="text" value={content.author || ""} onChange={(e) => updateContent("author", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }} /></div>
        </div>
      )}

      {localBlock.block_type === "button" && (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Button Text</label>
          <input type="text" value={content.text || ""} onChange={(e) => updateContent("text", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Link URL</label>
          <input type="url" value={content.href || ""} onChange={(e) => updateContent("href", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }} /></div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
        <button onClick={() => onSave(localBlock)} className="px-3 py-1.5 text-white text-sm font-medium rounded-lg"
          style={{ background: "var(--gradient-primary)" }}>💾 Save Block</button>
        <button onClick={onCancel} className="px-3 py-1.5 text-sm font-medium rounded-lg"
          style={{ color: "var(--text-secondary)", background: "var(--bg-card)" }}>Cancel</button>
      </div>
    </div>
  );
}
