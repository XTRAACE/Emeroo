"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Section {
  id: string; title: string; slug: string; section_type: string; content: Record<string, unknown>;
  display_order: number; pinned: boolean; published: boolean; show_in_navbar: boolean;
  navbar_label: string; navbar_order: number; navbar_enabled: boolean; navbar_important: boolean;
  title_color: string | null; title_alignment: string | null;
}

interface ContentBlock {
  id: string; section_id: string; block_type: string; content: Record<string, unknown>;
  media_url: string | null; youtube_url: string | null; display_order: number;
  width: string; alignment: string; published: boolean;
  row_id: string | null; columns: number;
}

interface RowGroup {
  id: string;
  blocks: ContentBlock[];
  columns: number;
}

const blockTypes = [
  { value: "heading", label: "Heading", icon: "H", color: "#3b82f6" },
  { value: "paragraph", label: "Paragraph", icon: "¶", color: "#8b5cf6" },
  { value: "image", label: "Image", icon: "🖼", color: "#10b981" },
  { value: "youtube_video", label: "YouTube Video", icon: "▶", color: "#ef4444" },
  { value: "button", label: "Button", icon: "🔗", color: "#f59e0b" },
  { value: "card", label: "Card", icon: "□", color: "#06b6d4" },
  { value: "quote", label: "Quote", icon: "❝", color: "#ec4899" },
];

const rowLayouts = [
  { columns: 1, label: "1 Column", icon: "█" },
  { columns: 2, label: "2 Columns", icon: "██" },
  { columns: 3, label: "3 Columns", icon: "███" },
  { columns: 4, label: "4 Columns", icon: "████" },
];

export default function SectionsAdmin() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Record<string, ContentBlock[]>>({});
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", section_type: "custom", show_in_navbar: false, navbar_label: "" });
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [showAddRow, setShowAddRow] = useState(false);
  const [addRowAtEnd, setAddRowAtEnd] = useState(true);

  const fetchSections = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const queryPromise = sb.from("sections").select("*").order("display_order", { ascending: true });
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 8000));
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as { data: Section[] | null; error: { message: string } | null };
      if (error) console.error("Sections fetch error:", error.message);
      setSections((data as Section[]) || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const fetchBlocks = async (sectionId: string) => {
    try {
      const sb = getSupabaseClient();
      const { data } = await sb.from("content_blocks").select("*").eq("section_id", sectionId).order("display_order", { ascending: true });
      setBlocks((prev) => ({ ...prev, [sectionId]: (data as ContentBlock[]) || [] }));
    } catch (err) { console.error(err); }
  };

  const selectSection = (sectionId: string) => {
    setSelectedSection(sectionId);
    setEditingBlock(null);
    if (!blocks[sectionId]) fetchBlocks(sectionId);
  };

  const getRows = (sectionId: string): RowGroup[] => {
    const sectionBlocks = blocks[sectionId] || [];
    const rowMap = new Map<string, RowGroup>();
    const standaloneMap = new Map<string, ContentBlock>();

    sectionBlocks.forEach((block) => {
      if (block.row_id) {
        if (!rowMap.has(block.row_id)) {
          rowMap.set(block.row_id, { id: block.row_id, blocks: [], columns: block.columns || 2 });
        }
        const row = rowMap.get(block.row_id)!;
        row.blocks.push(block);
        if (block.columns && block.columns > row.columns) row.columns = block.columns;
      } else {
        // Use block.id as key to prevent duplicates
        standaloneMap.set(block.id, block);
      }
    });

    // Convert to array and sort by display_order
    const rows: RowGroup[] = [];
    rowMap.forEach((row) => {
      row.blocks.sort((a, b) => a.display_order - b.display_order);
      rows.push(row);
    });

    // Sort standalone blocks into their own single-block rows
    const standalone = Array.from(standaloneMap.values());
    standalone.sort((a, b) => a.display_order - b.display_order);
    standalone.forEach((block) => {
      rows.push({ id: `standalone-${block.id}`, blocks: [block], columns: 1 });
    });

    // Sort all rows by first block's display_order
    rows.sort((a, b) => {
      const aOrder = a.blocks[0]?.display_order ?? 0;
      const bOrder = b.blocks[0]?.display_order ?? 0;
      return aOrder - bOrder;
    });

    return rows;
  };

  const addRow = async (columns: number) => {
    if (!selectedSection) return;
    const sb = getSupabaseClient();
    const rowId = `row-${Date.now()}`;
    const sectionBlocks = blocks[selectedSection] || [];
    const maxOrder = sectionBlocks.length > 0 ? Math.max(...sectionBlocks.map(b => b.display_order)) + 1 : 0;

    // Create a placeholder block for each column
    const inserts = Array.from({ length: columns }, (_, i) => ({
      section_id: selectedSection,
      block_type: "paragraph",
      content: { text: "" },
      display_order: maxOrder + i,
      width: "full",
      alignment: "left",
      padding: "default",
      row_id: rowId,
      columns,
      published: true,
    }));

    const { error } = await sb.from("content_blocks").insert(inserts);
    if (error) console.error("Add row error:", error.message);
    setShowAddRow(false);
    fetchBlocks(selectedSection);
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

  const deleteSection = async (id: string) => {
    if (!confirm("Delete this section and all its content?")) return;
    const sb = getSupabaseClient();
    await sb.from("content_blocks").delete().eq("section_id", id);
    await sb.from("sections").delete().eq("id", id);
    if (selectedSection === id) setSelectedSection(null);
    fetchSections();
  };

  const addBlockToRow = async (rowId: string, type: string) => {
    if (!selectedSection) return;
    const sb = getSupabaseClient();
    const sectionBlocks = blocks[selectedSection] || [];
    const rowBlocks = sectionBlocks.filter(b => b.row_id === rowId);
    const maxOrder = sectionBlocks.length > 0 ? Math.max(...sectionBlocks.map(b => b.display_order)) + 1 : 0;
    const columns = rowBlocks[0]?.columns || 2;

    const defaultContent: Record<string, string> = {};
    if (type === "heading") defaultContent.text = "New Heading";
    else if (type === "paragraph") defaultContent.text = "";
    else if (type === "button") { defaultContent.text = "Click me"; defaultContent.href = "#"; }
    else if (type === "card") { defaultContent.icon = "🚨"; defaultContent.title = "Card"; defaultContent.text = "Description"; }
    else if (type === "quote") { defaultContent.text = "Quote text"; defaultContent.author = "Author"; }

    const { error } = await sb.from("content_blocks").insert({
      section_id: selectedSection, block_type: type, content: defaultContent,
      display_order: maxOrder, width: "full", alignment: "left", padding: "default",
      row_id: rowId, columns, published: true,
    });
    if (error) console.error("Add block error:", error.message);
    fetchBlocks(selectedSection);
  };

  const addStandaloneBlock = async (type: string) => {
    if (!selectedSection) return;
    const sb = getSupabaseClient();
    const sectionBlocks = blocks[selectedSection] || [];
    const maxOrder = sectionBlocks.length > 0 ? Math.max(...sectionBlocks.map(b => b.display_order)) + 1 : 0;

    const defaultContent: Record<string, string> = {};
    if (type === "heading") defaultContent.text = "New Heading";
    else if (type === "paragraph") defaultContent.text = "";
    else if (type === "button") { defaultContent.text = "Click me"; defaultContent.href = "#"; }
    else if (type === "card") { defaultContent.icon = "🚨"; defaultContent.title = "Card"; defaultContent.text = "Description"; }
    else if (type === "quote") { defaultContent.text = "Quote text"; defaultContent.author = "Author"; }

    const { error } = await sb.from("content_blocks").insert({
      section_id: selectedSection, block_type: type, content: defaultContent,
      display_order: maxOrder, width: "full", alignment: "left", padding: "default",
      row_id: null, columns: 1, published: true,
    });
    if (error) console.error("Add block error:", error.message);
    fetchBlocks(selectedSection);
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
    if (!confirm("Delete this block?")) return;
    const sb = getSupabaseClient();
    await sb.from("content_blocks").delete().eq("id", block.id);
    fetchBlocks(block.section_id);
  };

  const moveBlock = async (block: ContentBlock, direction: "up" | "down") => {
    const sectionBlocks = blocks[block.section_id] || [];
    const idx = sectionBlocks.findIndex(b => b.id === block.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sectionBlocks.length) return;
    const sb = getSupabaseClient();
    const other = sectionBlocks[swapIdx];
    const tempOrder = block.display_order;
    await sb.from("content_blocks").update({ display_order: other.display_order }).eq("id", block.id);
    await sb.from("content_blocks").update({ display_order: tempOrder }).eq("id", other.id);
    fetchBlocks(block.section_id);
  };

  const updateRowColumns = async (rowId: string, newColumns: number) => {
    if (!selectedSection) return;
    const sb = getSupabaseClient();
    await sb.from("content_blocks").update({ columns: newColumns }).eq("row_id", rowId);
    fetchBlocks(selectedSection);
  };

  const deleteRow = async (rowId: string) => {
    if (!confirm("Delete this entire row and all its blocks?")) return;
    if (!selectedSection) return;
    const sb = getSupabaseClient();
    await sb.from("content_blocks").delete().eq("row_id", rowId);
    fetchBlocks(selectedSection);
  };

  const getBlockPreview = (block: ContentBlock): string => {
    const content = block.content as Record<string, string>;
    if (block.block_type === "heading" || block.block_type === "paragraph") return content.text || "";
    if (block.block_type === "image") return block.media_url ? "🖼" : "";
    if (block.block_type === "youtube_video") return "▶";
    if (block.block_type === "card") return content.title || "";
    if (block.block_type === "quote") return `"${content.text || ""}"`;
    return content.text || "";
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const selectedSectionData = sections.find(s => s.id === selectedSection);
  const rows = selectedSection ? getRows(selectedSection) : [];

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Left Sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Sections</h2>
            <button onClick={() => { setEditingSection(null); setForm({ title: "", slug: "", section_type: "custom", show_in_navbar: false, navbar_label: "" }); setShowModal(true); }}
              className="px-3 py-1.5 text-white text-sm font-medium rounded-lg" style={{ background: "var(--gradient-primary)" }}>+ New</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sections.map((section) => (
            <div key={section.id} onClick={() => selectSection(section.id)}
              className="rounded-xl p-3 cursor-pointer transition-all"
              style={{ background: selectedSection === section.id ? "var(--bg-primary)" : "transparent", border: selectedSection === section.id ? "2px solid var(--accent-primary)" : "2px solid transparent" }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{section.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: section.published ? "rgba(22,163,74,0.15)" : "rgba(234,179,8,0.15)", color: section.published ? "#16a34a" : "#ca8a04" }}>
                      {section.published ? "✓" : "○"}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{(blocks[section.id] || []).length} blocks</span>
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => togglePublished(section)} className="p-1 rounded text-xs" style={{ color: section.published ? "#16a34a" : "var(--text-muted)" }}>✓</button>
                  <button onClick={() => deleteSection(section.id)} className="p-1 rounded text-xs" style={{ color: "#ef4444" }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
        {!selectedSection ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📐</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Section Page Builder</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select a section to build with rows and blocks</p>
            </div>
          </div>
        ) : (
          <>
            {/* Section Header with Title Editor */}
            <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-4 flex-wrap">
                {/* Title Input */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Section Title</label>
                  <input type="text" value={selectedSectionData?.title || ""}
                    onChange={async (e) => {
                      const sb = getSupabaseClient();
                      await sb.from("sections").update({ title: e.target.value }).eq("id", selectedSection);
                      setSections((prev) => prev.map(s => s.id === selectedSection ? { ...s, title: e.target.value } : s));
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: selectedSectionData?.title_color || "var(--text-primary)" }}
                    placeholder="Section Title" />
                </div>

                {/* Title Color Picker */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Title Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={selectedSectionData?.title_color || "#ffffff"}
                      onChange={async (e) => {
                        const sb = getSupabaseClient();
                        await sb.from("sections").update({ title_color: e.target.value }).eq("id", selectedSection);
                        setSections((prev) => prev.map(s => s.id === selectedSection ? { ...s, title_color: e.target.value } : s));
                      }}
                      className="w-10 h-10 rounded-lg border cursor-pointer" />
                    <input type="text" value={selectedSectionData?.title_color || ""}
                      onChange={async (e) => {
                        const sb = getSupabaseClient();
                        await sb.from("sections").update({ title_color: e.target.value }).eq("id", selectedSection);
                        setSections((prev) => prev.map(s => s.id === selectedSection ? { ...s, title_color: e.target.value } : s));
                      }}
                      className="w-24 px-2 py-2 rounded-lg text-xs"
                      style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                      placeholder="#ffffff" />
                    {/* Preset Colors */}
                    {["#ffffff", "#fca5a5", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6"].map((color) => (
                      <button key={color} onClick={async () => {
                        const sb = getSupabaseClient();
                        await sb.from("sections").update({ title_color: color }).eq("id", selectedSection);
                        setSections((prev) => prev.map(s => s.id === selectedSection ? { ...s, title_color: color } : s));
                      }}
                        className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                        style={{ background: color, borderColor: selectedSectionData?.title_color === color ? "var(--text-primary)" : "transparent" }} />
                    ))}
                  </div>
                </div>

                {/* Title Alignment */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Alignment</label>
                  <div className="flex gap-1">
                    {["left", "center", "right"].map((align) => (
                      <button key={align} onClick={async () => {
                        const sb = getSupabaseClient();
                        await sb.from("sections").update({ title_alignment: align }).eq("id", selectedSection);
                        setSections((prev) => prev.map(s => s.id === selectedSection ? { ...s, title_alignment: align } : s));
                      }}
                        className="px-3 py-2 text-xs rounded-lg"
                        style={{
                          background: (selectedSectionData?.title_alignment || "center") === align ? "var(--accent-primary)" : "var(--bg-primary)",
                          color: (selectedSectionData?.title_alignment || "center") === align ? "#fff" : "var(--text-secondary)",
                          border: "1px solid var(--border-color)",
                        }}>
                        {align === "left" ? "←" : align === "center" ? "↔" : "→"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{rows.length} rows • {(blocks[selectedSection] || []).length} blocks</p>
            </div>

            {/* Page Builder Canvas */}
            <div className="flex-1 overflow-y-auto p-6" style={{ background: "var(--bg-primary)" }}>
              <div className="max-w-4xl mx-auto space-y-6">
                {rows.map((row) => (
                  <div key={row.id} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                    {/* Row Header */}
                    <div className="px-4 py-2 flex items-center justify-between" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>📐 Row</span>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{row.columns} col{row.columns > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Change columns */}
                        {rowLayouts.map((layout) => (
                          <button key={layout.columns} onClick={() => updateRowColumns(row.id, layout.columns)}
                            className="px-2 py-1 text-xs rounded transition-all"
                            style={{
                              background: row.columns === layout.columns ? "var(--accent-primary)" : "transparent",
                              color: row.columns === layout.columns ? "#fff" : "var(--text-muted)",
                            }} title={layout.label}>
                            {layout.icon}
                          </button>
                        ))}
                        <button onClick={() => deleteRow(row.id)} className="ml-2 px-2 py-1 text-xs rounded" style={{ color: "#ef4444" }}>🗑</button>
                      </div>
                    </div>

                    {/* Row Columns */}
                    <div className={`grid gap-4 p-4`} style={{ gridTemplateColumns: `repeat(${row.columns}, 1fr)` }}>
                      {row.blocks.map((block) => (
                        <div key={block.id}>
                          {editingBlock?.id === block.id ? (
                            <BlockEditor block={block} onSave={saveBlock} onCancel={() => setEditingBlock(null)} />
                          ) : (
                            <div className="rounded-lg p-3 cursor-pointer transition-all hover:shadow-md min-h-[80px]"
                              style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
                              onClick={() => setEditingBlock(block)}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs px-2 py-0.5 rounded font-medium"
                                  style={{ background: `${blockTypes.find(bt => bt.value === block.block_type)?.color || "#666"}15`, color: blockTypes.find(bt => bt.value === block.block_type)?.color }}>
                                  {blockTypes.find(bt => bt.value === block.block_type)?.icon} {block.block_type.replace("_", " ")}
                                </span>
                                <div className="flex gap-1 ml-auto">
                                  <button onClick={(e) => { e.stopPropagation(); moveBlock(block, "up"); }} className="text-xs" style={{ color: "var(--text-muted)" }}>▲</button>
                                  <button onClick={(e) => { e.stopPropagation(); moveBlock(block, "down"); }} className="text-xs" style={{ color: "var(--text-muted)" }}>▼</button>
                                  <button onClick={(e) => { e.stopPropagation(); deleteBlock(block); }} className="text-xs" style={{ color: "#ef4444" }}>✕</button>
                                </div>
                              </div>
                              <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                                {getBlockPreview(block) || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Click to edit</span>}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add Block to Row */}
                      <div className="rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md min-h-[80px]"
                        style={{ background: "var(--bg-primary)", border: "2px dashed var(--border-color)" }}
                        onClick={() => {}}>
                        <span className="text-lg" style={{ color: "var(--text-muted)" }}>+</span>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {blockTypes.slice(0, 4).map((bt) => (
                            <button key={bt.value} onClick={(e) => { e.stopPropagation(); addBlockToRow(row.id, bt.value); }}
                              className="px-2 py-1 text-xs rounded-lg font-medium transition-all hover:scale-105"
                              style={{ background: `${bt.color}15`, color: bt.color }}>
                              {bt.icon} {bt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Row */}
                <div className="rounded-xl p-6 text-center" style={{ background: "var(--bg-card)", border: "2px dashed var(--border-color)" }}>
                  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Add a new row</p>
                  <div className="flex justify-center gap-3">
                    {rowLayouts.map((layout) => (
                      <button key={layout.columns} onClick={() => addRow(layout.columns)}
                        className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all hover:scale-105"
                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)" }}>
                        <span className="text-xl" style={{ color: "var(--accent-primary)" }}>{layout.icon}</span>
                        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{layout.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Standalone Block */}
                <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                  <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>Or add a full-width block:</p>
                  <div className="flex flex-wrap gap-2">
                    {blockTypes.map((bt) => (
                      <button key={bt.value} onClick={() => addStandaloneBlock(bt.value)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all hover:scale-105"
                        style={{ background: `${bt.color}15`, color: bt.color, border: `1px solid ${bt.color}20` }}>
                        {bt.icon} {bt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Section Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="rounded-2xl w-full max-w-lg p-6 shadow-2xl" style={{ background: "var(--bg-card)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{editingSection ? "Edit Section" : "Create Section"}</h3>
              <button onClick={() => { setShowModal(false); setEditingSection(null); }} className="p-1 rounded-lg hover:bg-black/5" style={{ color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                  placeholder="e.g. How It Works" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                  placeholder="auto-generated" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.show_in_navbar} onChange={(e) => setForm({ ...form, show_in_navbar: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>Show in Navbar</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditingSection(null); }} className="px-4 py-2.5 font-medium rounded-xl" style={{ color: "var(--text-secondary)", background: "var(--bg-primary)" }}>Cancel</button>
              <button onClick={saveSection} disabled={!form.title} className="px-4 py-2.5 text-white font-medium rounded-xl disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>{editingSection ? "Save" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockEditor({ block, onSave, onCancel }: { block: ContentBlock; onSave: (b: ContentBlock) => void; onCancel: () => void }) {
  const [localBlock, setLocalBlock] = useState<ContentBlock>({ ...block });
  const [uploading, setUploading] = useState(false);
  const content = localBlock.content as Record<string, string>;

  const updateContent = (key: string, value: string) => {
    setLocalBlock({ ...localBlock, content: { ...localBlock.content, [key]: value } });
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const sb = getSupabaseClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const { error } = await sb.storage.from("content-images").upload(`content-blocks/${fileName}`, file);
      if (error) throw error;
      const { data } = sb.storage.from("content-images").getPublicUrl(`content-blocks/${fileName}`);
      setLocalBlock((prev) => ({ ...prev, media_url: data.publicUrl }));
    } catch (err) { console.error("Upload failed:", err); }
    setUploading(false);
  };

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-card)", border: "2px solid var(--accent-primary)" }}>
      {/* Block Type */}
      <div className="flex items-center gap-1 flex-wrap">
        {blockTypes.map((bt) => (
          <button key={bt.value} onClick={() => setLocalBlock({ ...localBlock, block_type: bt.value })}
            className="px-2 py-1 text-xs rounded-lg font-medium transition-all"
            style={{ background: localBlock.block_type === bt.value ? bt.color : `${bt.color}15`, color: localBlock.block_type === bt.value ? "#fff" : bt.color }}>
            {bt.icon} {bt.label}
          </button>
        ))}
      </div>

      {/* Content Fields */}
      {(localBlock.block_type === "heading" || localBlock.block_type === "paragraph") && (
        <textarea value={content.text || ""} onChange={(e) => updateContent("text", e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
          rows={localBlock.block_type === "heading" ? 2 : 4}
          placeholder={localBlock.block_type === "heading" ? "Enter heading..." : "Enter paragraph text..."} />
      )}

      {localBlock.block_type === "image" && (
        <div className="space-y-2">
          <input type="url" value={localBlock.media_url || ""} onChange={(e) => setLocalBlock({ ...localBlock, media_url: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm" placeholder="Image URL"
            style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer" style={{ background: "var(--bg-primary)", border: "1px dashed var(--border-color)" }}>
            📁 {uploading ? "Uploading..." : "Upload Image"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          </label>
          {localBlock.media_url && <img src={localBlock.media_url} alt="Preview" className="w-full h-32 object-contain rounded-lg" />}
        </div>
      )}

      {localBlock.block_type === "youtube_video" && (
        <input type="url" value={localBlock.youtube_url || ""} onChange={(e) => setLocalBlock({ ...localBlock, youtube_url: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm" placeholder="https://youtube.com/watch?v=..."
          style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
      )}

      {localBlock.block_type === "card" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={content.icon || ""} onChange={(e) => updateContent("icon", e.target.value)} placeholder="Icon 🚨" className="px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
            <input type="text" value={content.title || ""} onChange={(e) => updateContent("title", e.target.value)} placeholder="Title" className="px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
          </div>
          <textarea value={content.text || ""} onChange={(e) => updateContent("text", e.target.value)} placeholder="Description" className="w-full px-3 py-2 rounded-lg text-sm" rows={2} style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
        </div>
      )}

      {localBlock.block_type === "quote" && (
        <div className="space-y-2">
          <textarea value={content.text || ""} onChange={(e) => updateContent("text", e.target.value)} placeholder="Quote text" className="w-full px-3 py-2 rounded-lg text-sm italic" rows={2} style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
          <input type="text" value={content.author || ""} onChange={(e) => updateContent("author", e.target.value)} placeholder="Author" className="w-full px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
        </div>
      )}

      {localBlock.block_type === "button" && (
        <div className="grid grid-cols-2 gap-2">
          <input type="text" value={content.text || ""} onChange={(e) => updateContent("text", e.target.value)} placeholder="Button text" className="px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
          <input type="url" value={content.href || ""} onChange={(e) => updateContent("href", e.target.value)} placeholder="Link URL" className="px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
        </div>
      )}

      {/* Alignment */}
      <select value={localBlock.alignment || "left"} onChange={(e) => setLocalBlock({ ...localBlock, alignment: e.target.value })}
        className="px-3 py-1.5 rounded-lg text-xs" style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
        <option value="left">← Left</option><option value="center">↔ Center</option><option value="right">→ Right</option>
      </select>

      {/* Save/Cancel */}
      <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
        <button onClick={() => onSave(localBlock)} className="px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ background: "var(--gradient-primary)" }}>💾 Save</button>
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium rounded-lg" style={{ color: "var(--text-secondary)", background: "var(--bg-primary)" }}>Cancel</button>
      </div>
    </div>
  );
}
