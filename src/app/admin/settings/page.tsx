"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Settings {
  [key: string]: Record<string, unknown>;
}

export default function SiteSettingsAdmin() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [activeTab, setActiveTab] = useState("hero");

  const fetchData = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data } = await sb.from("site_settings").select("*");
      if (data) {
        const mapped: Settings = {};
        data.forEach((row: { id: string; value: Record<string, unknown> }) => {
          mapped[row.id] = row.value || {};
        });
        setSettings(mapped);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateSetting = (section: string, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [key]: value },
    }));
  };

  const saveAll = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const sb = getSupabaseClient();
      for (const [id, value] of Object.entries(settings)) {
        const { error } = await sb.from("site_settings").upsert({ id, value, updated_at: new Date().toISOString() });
        if (error) {
          setSaveMsg("Error saving: " + error.message);
          setSaving(false);
          return;
        }
      }
      setSaveMsg("✓ All settings saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg("Error: " + (err as Error).message);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const tabs = [
    { id: "hero", label: "Hero Section", icon: "🎬" },
    { id: "navbar", label: "Navbar", icon: "🔗" },
    { id: "theme", label: "Theme Colors", icon: "🎨" },
    { id: "footer", label: "Footer", icon: "📄" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Site Settings</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Edit all website text, colors, and content from here
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="px-6 py-2.5 text-white font-medium rounded-xl disabled:opacity-50"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      {saveMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm ${saveMsg.startsWith("✓") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {saveMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: activeTab === tab.id ? "var(--accent-primary)" : "var(--bg-card)",
              color: activeTab === tab.id ? "#ffffff" : "var(--text-secondary)",
              border: activeTab === tab.id ? "none" : "1px solid var(--border-color)",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Settings */}
      {activeTab === "hero" && (
        <div className="card space-y-4">
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Hero Section Content</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Edit the main hero section that appears at the top of your website
          </p>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Badge Text</label>
            <input type="text" value={(settings.hero?.badge as string) || ""} onChange={(e) => updateSetting("hero", "badge", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="Emergency Response Technology" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Main Title</label>
            <textarea value={(settings.hero?.title as string) || ""} onChange={(e) => updateSetting("hero", "title", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              rows={2} placeholder="When Every Second Matters..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Subtitle</label>
            <textarea value={(settings.hero?.subtitle as string) || ""} onChange={(e) => updateSetting("hero", "subtitle", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              rows={3} placeholder="EMERO is an intelligent..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Primary CTA Button</label>
              <input type="text" value={(settings.hero?.cta_primary as string) || ""} onChange={(e) => updateSetting("hero", "cta_primary", e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                placeholder="Explore EMERO" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Secondary CTA Button</label>
              <input type="text" value={(settings.hero?.cta_secondary as string) || ""} onChange={(e) => updateSetting("hero", "cta_secondary", e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                placeholder="See How It Works" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              🎥 Hero Background Video (optional)
            </label>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              Upload a video file or paste a video URL. This will play as the background of the hero section.
            </p>
            <input type="url" value={(settings.hero?.video_url as string) || ""} onChange={(e) => updateSetting("hero", "video_url", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="Paste video URL or upload file" />
            {(settings.hero?.video_url as string) && (
              <div className="mt-3 rounded-xl overflow-hidden bg-gray-900">
                <video controls className="w-full max-h-48" src={settings.hero?.video_url as string} />
              </div>
            )}
            <label className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
              📁 Upload Video File
              <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => updateSetting("hero", "video_url", reader.result as string);
                reader.readAsDataURL(file);
              }} />
            </label>
          </div>
        </div>
      )}

      {/* Navbar Settings */}
      {activeTab === "navbar" && (
        <div className="card space-y-4">
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Navbar Settings</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Customize the navigation bar appearance and content
          </p>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Logo Text</label>
            <input type="text" value={(settings.navbar?.logo_text as string) || ""} onChange={(e) => updateSetting("navbar", "logo_text", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="EMERO" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Background Color</label>
              <div className="flex gap-2">
                <input type="color" value={(settings.navbar?.bg_color as string) || "#dc2626"} onChange={(e) => updateSetting("navbar", "bg_color", e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer" />
                <input type="text" value={(settings.navbar?.bg_color as string) || ""} onChange={(e) => updateSetting("navbar", "bg_color", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-xl text-sm"
                  style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Text Color</label>
              <div className="flex gap-2">
                <input type="color" value={(settings.navbar?.text_color as string) || "#ffffff"} onChange={(e) => updateSetting("navbar", "text_color", e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer" />
                <input type="text" value={(settings.navbar?.text_color as string) || ""} onChange={(e) => updateSetting("navbar", "text_color", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-xl text-sm"
                  style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Accent Color</label>
              <div className="flex gap-2">
                <input type="color" value={(settings.navbar?.accent_color as string) || "#fca5a5"} onChange={(e) => updateSetting("navbar", "accent_color", e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer" />
                <input type="text" value={(settings.navbar?.accent_color as string) || ""} onChange={(e) => updateSetting("navbar", "accent_color", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-xl text-sm"
                  style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Navbar Style</label>
            <div className="flex gap-3">
              {["solid", "transparent", "glass"].map((style) => (
                <button key={style} onClick={() => updateSetting("navbar", "style", style)}
                  className="px-4 py-2 rounded-xl text-sm font-medium capitalize"
                  style={{
                    background: (settings.navbar?.style || "solid") === style ? "var(--accent-primary)" : "var(--bg-primary)",
                    color: (settings.navbar?.style || "solid") === style ? "#ffffff" : "var(--text-secondary)",
                    border: (settings.navbar?.style || "solid") === style ? "none" : "1px solid var(--border-color)",
                  }}>
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Theme Colors */}
      {activeTab === "theme" && (
        <div className="card space-y-4">
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Theme Colors</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Customize the primary color scheme of the website
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Primary Color</label>
              <input type="color" value={(settings.theme?.primary as string) || "#dc2626"} onChange={(e) => updateSetting("theme", "primary", e.target.value)}
                className="w-full h-12 rounded-xl border cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Light Color</label>
              <input type="color" value={(settings.theme?.primary_light as string) || "#fca5a5"} onChange={(e) => updateSetting("theme", "primary_light", e.target.value)}
                className="w-full h-12 rounded-xl border cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Dark Color</label>
              <input type="color" value={(settings.theme?.primary_dark as string) || "#991b1b"} onChange={(e) => updateSetting("theme", "primary_dark", e.target.value)}
                className="w-full h-12 rounded-xl border cursor-pointer" />
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: "var(--bg-primary)" }}>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Preview</p>
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl" style={{ background: String(settings.theme?.primary || "#dc2626") }} />
              <div className="w-12 h-12 rounded-xl" style={{ background: String(settings.theme?.primary_light || "#fca5a5") }} />
              <div className="w-12 h-12 rounded-xl" style={{ background: String(settings.theme?.primary_dark || "#991b1b") }} />
            </div>
          </div>
        </div>
      )}

      {/* Footer Settings */}
      {activeTab === "footer" && (
        <div className="card space-y-4">
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Footer Settings</h3>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Copyright Text</label>
            <input type="text" value={(settings.footer?.copyright as string) || ""} onChange={(e) => updateSetting("footer", "copyright", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Tagline</label>
            <input type="text" value={(settings.footer?.tagline as string) || ""} onChange={(e) => updateSetting("footer", "tagline", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
          </div>
        </div>
      )}
    </div>
  );
}
