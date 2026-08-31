"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
// Icons use emoji instead of lucide-react

interface NavSection {
  id: string; title: string; slug: string; show_in_navbar: boolean;
  navbar_label: string; navbar_order: number; navbar_enabled: boolean; navbar_important: boolean;
}

export default function NavbarAdmin() {
  const [sections, setSections] = useState<NavSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data } = await sb.from("sections").select("id, title, slug, show_in_navbar, navbar_label, navbar_order, navbar_enabled, navbar_important").order("navbar_order", { ascending: true });
      setSections((data as NavSection[]) || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleNavbar = async (section: NavSection) => {
    const sb = getSupabaseClient();
    const navCount = sections.filter(s => s.show_in_navbar).length;
    if (!section.show_in_navbar) {
      // Adding to navbar — assign next order
      await sb.from("sections").update({
        show_in_navbar: true,
        navbar_enabled: true,
        navbar_order: navCount,
        navbar_label: section.navbar_label || section.title,
      }).eq("id", section.id);
    } else {
      // Removing from navbar
      await sb.from("sections").update({
        show_in_navbar: false,
        navbar_enabled: false,
        navbar_order: 0,
      }).eq("id", section.id);
    }
    fetchData();
  };

  const toggleImportant = async (section: NavSection) => {
    const sb = getSupabaseClient();
    await sb.from("sections").update({ navbar_important: !section.navbar_important }).eq("id", section.id);
    fetchData();
  };

  const saveLabel = async (section: NavSection) => {
    const sb = getSupabaseClient();
    await sb.from("sections").update({ navbar_label: editLabel }).eq("id", section.id);
    setEditingId(null);
    fetchData();
  };

  const moveItem = async (section: NavSection, dir: "up" | "down") => {
    const navSections = sections.filter(s => s.show_in_navbar).sort((a, b) => a.navbar_order - b.navbar_order);
    const idx = navSections.findIndex(s => s.id === section.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= navSections.length) return;

    const sb = getSupabaseClient();
    const other = navSections[swapIdx];
    const tempOrder = section.navbar_order;

    // Swap navbar_order values
    await sb.from("sections").update({ navbar_order: other.navbar_order }).eq("id", section.id);
    await sb.from("sections").update({ navbar_order: tempOrder }).eq("id", other.id);
    fetchData();
  };

  // Drag handlers
  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  };

  const handleDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    const navSections = sections.filter(s => s.show_in_navbar).sort((a, b) => a.navbar_order - b.navbar_order);
    const dragged = navSections[dragIdx];
    const target = navSections[targetIdx];

    if (dragged && target) {
      const sb = getSupabaseClient();
      const draggedOrder = dragged.navbar_order;
      const targetOrder = target.navbar_order;

      // Move all items between dragged and target
      if (dragIdx < targetIdx) {
        // Moving down: shift items between dragged and target up by 1
        for (const s of navSections) {
          if (s.id !== dragged.id && s.navbar_order > draggedOrder && s.navbar_order <= targetOrder) {
            await sb.from("sections").update({ navbar_order: s.navbar_order - 1 }).eq("id", s.id);
          }
        }
        await sb.from("sections").update({ navbar_order: targetOrder }).eq("id", dragged.id);
      } else {
        // Moving up: shift items between target and dragged down by 1
        for (const s of navSections) {
          if (s.id !== dragged.id && s.navbar_order >= targetOrder && s.navbar_order < draggedOrder) {
            await sb.from("sections").update({ navbar_order: s.navbar_order + 1 }).eq("id", s.id);
          }
        }
        await sb.from("sections").update({ navbar_order: targetOrder }).eq("id", dragged.id);
      }
      fetchData();
    }

    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  const navSections = sections.filter(s => s.show_in_navbar).sort((a, b) => a.navbar_order - b.navbar_order);
  const availableSections = sections.filter(s => !s.show_in_navbar);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Navbar Manager</h2>
        <p className="text-gray-500 text-sm mt-1">Drag to reorder, click to edit, star to highlight</p>
      </div>

      {/* Active navbar items */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-4 h-4 text-green-500" /> Active Navbar ({navSections.length} items)
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {navSections.map((section, idx) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 px-5 py-3 transition-all select-none ${
                dragOverIdx === idx ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
              } ${dragIdx === idx ? "opacity-40 scale-[0.98]" : ""}`}
            >
              <span className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />

              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => moveItem(section, "up")} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▲</button>
                <button onClick={() => moveItem(section, "down")} disabled={idx === navSections.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">▼</button>
              </div>

              <span className="text-xs font-mono text-gray-300 w-6 text-center flex-shrink-0">{idx + 1}</span>

              {/* Editable label */}
              {editingId === section.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveLabel(section); if (e.key === "Escape") setEditingId(null); }}
                    className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    autoFocus
                  />
                  <button onClick={() => saveLabel(section)} className="p-1 text-green-600 hover:bg-green-50 rounded"><span className="w-4 h-4" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">✕</button>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <span
                    className="text-sm font-medium text-gray-800 truncate cursor-pointer hover:text-blue-600 inline-block"
                    onClick={() => { setEditingId(section.id); setEditLabel(section.navbar_label || section.title); }}
                  >
                    {section.navbar_label || section.title}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">#{section.slug}</span>
                </div>
              )}

              <button onClick={() => toggleImportant(section)} className={`p-1.5 rounded-lg transition-colors ${section.navbar_important ? "text-yellow-500 bg-yellow-50" : "text-gray-300 hover:text-yellow-400 hover:bg-gray-100"}`} title="Mark as important">
                ⭐
              </button>

              <button onClick={() => { setEditingId(section.id); setEditLabel(section.navbar_label || section.title); }} className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit label">
                ✏️
              </button>

              <button onClick={() => toggleNavbar(section)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Remove from navbar">
                🗑️
              </button>
            </div>
          ))}
          {navSections.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-400 text-sm">No items in navbar yet.</p>
              <p className="text-gray-400 text-xs mt-1">Add sections from the pool below.</p>
            </div>
          )}
        </div>
      </div>

      {/* Available sections pool */}
      {availableSections.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-4 h-4 text-gray-400" /> Available Sections ({availableSections.length})
            </h3>
            <p className="text-xs text-gray-400 mt-1">Click &quot;Add to Navbar&quot; to include in navigation</p>
          </div>
          <div className="divide-y divide-gray-50">
            {availableSections.map((section) => (
              <div key={section.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700">{section.title}</span>
                  <span className="text-xs text-gray-400 ml-2">#{section.slug}</span>
                </span>
                <button onClick={() => toggleNavbar(section)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors">
                  <span className="w-3.5 h-3.5" /> Add to Navbar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sections.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No sections exist yet.</p>
          <p className="text-gray-400 text-sm mt-1">Create sections first in <strong>Sections</strong> manager, then come back to add them to the navbar.</p>
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-4 space-y-2">
        <p className="text-sm text-blue-700"><strong>How it works:</strong></p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• <strong>Drag</strong> the ⠿ grip handle to reorder navbar items</li>
          <li>• <strong>Click the label</strong> or ✏️ to rename inline</li>
          <li>• <strong>★ Star</strong> to mark as important</li>
          <li>• <strong>🗑️ Trash</strong> to remove from navbar (section stays, just hidden from nav)</li>
          <li>• <strong>+ Add to Navbar</strong> to include a section in navigation</li>
        </ul>
      </div>
    </div>
  );
}
