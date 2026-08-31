"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
// Icons use emoji instead of lucide-react

interface Page {
  id: string; title: string; slug: string; description: string;
  published: boolean; seo_title: string; seo_description: string; created_at: string;
}

export default function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "", seo_title: "", seo_description: "" });

  const fetchData = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data } = await sb.from("pages").select("*").order("created_at", { ascending: true });
      setPages((data as Page[]) || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    try {
      const sb = getSupabaseClient();
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (editing) {
        await sb.from("pages").update({ ...form, slug }).eq("id", editing.id);
      } else {
        await sb.from("pages").insert({ ...form, slug, published: true });
      }
      setShowModal(false); setEditing(null);
      setForm({ title: "", slug: "", description: "", seo_title: "", seo_description: "" });
      fetchData();
    } catch (err) { console.error(err); alert("Failed to save"); }
  };

  const togglePublished = async (page: Page) => {
    const sb = getSupabaseClient();
    await sb.from("pages").update({ published: !page.published }).eq("id", page.id);
    fetchData();
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete page and all its sections?")) return;
    const sb = getSupabaseClient();
    await sb.from("pages").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Pages</h2><p className="text-gray-500 text-sm mt-1">Manage website pages</p></div>
        <button onClick={() => { setEditing(null); setForm({ title: "", slug: "", description: "", seo_title: "", seo_description: "" }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">+  Add Page</button>
      </div>
      <div className="space-y-3">
        {pages.map((page) => (
          <div key={page.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{page.title}</h3>
                {!page.published && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Draft</span>}
              </div>
              <p className="text-gray-400 text-xs mt-1">/{page.slug}</p>
              {page.description && <p className="text-gray-500 text-sm mt-1">{page.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => togglePublished(page)} className={`p-2 rounded-lg ${page.published ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>{page.published ? "Yes" : "No"}</button>
              <button onClick={() => { setEditing(page); setForm({ title: page.title, slug: page.slug, description: page.description, seo_title: page.seo_title, seo_description: page.seo_description }); setShowModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
              <button onClick={() => deletePage(page.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
            </div>
          </div>
        ))}
        {pages.length === 0 && <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><p className="text-gray-500">No pages yet.</p></div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold">{editing ? "Edit Page" : "Create Page"}</h3><button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1 hover:bg-gray-100 rounded">✕</button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="auto-generated" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label><input type="text" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label><textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2.5 text-gray-700 bg-gray-100 font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={save} disabled={!form.title} className="px-4 py-2.5 text-white font-medium rounded-xl disabled:opacity-50" style={{ background: "linear-gradient(135deg, #4f7cff, #7c5cfc)" }}>{editing ? "Save" : "Create Page"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
