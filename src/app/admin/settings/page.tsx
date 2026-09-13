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
      const queryPromise = sb.from("site_settings").select("*");
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Check your Supabase connection.")), 8000)
      );
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as { data: { id: string; value: Record<string, unknown> }[] | null; error: { message: string } | null };
      if (error) {
        console.error("Supabase error:", error.message);
        setSaveMsg("⚠️ Could not load settings: " + error.message);
      }
      if (data) {
        const mapped: Settings = {};
        data.forEach((row: { id: string; value: Record<string, unknown> }) => {
          mapped[row.id] = row.value || {};
        });
        setSettings(mapped);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setSaveMsg("⚠️ " + (err as Error).message);
    } finally {
      setLoading(false);
    }
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
    { id: "contact", label: "Contact", icon: "💬" },
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
            Customize the navigation bar appearance, logo, and content
          </p>

          {/* Logo Text */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Logo Text</label>
            <input type="text" value={(settings.navbar?.logo_text as string) || ""} onChange={(e) => updateSetting("navbar", "logo_text", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="EMERO" />
          </div>

          {/* Logo Image */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Logo Image (optional)</label>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Upload a logo image to replace the default "E" icon. Recommended: square image, max 200x200px.</p>
            <input type="url" value={(settings.navbar?.logo_url as string) || ""} onChange={(e) => updateSetting("navbar", "logo_url", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="https://... or upload below" />
            <label className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
              📁 Upload Logo Image
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => updateSetting("navbar", "logo_url", reader.result as string);
                reader.readAsDataURL(file);
              }} />
            </label>
            {(settings.navbar?.logo_url as string) && (
              <div className="mt-2 inline-block">
                <img src={settings.navbar.logo_url as string} alt="Logo preview" className="h-12 w-auto rounded-lg" style={{ background: "var(--bg-primary)" }} />
              </div>
            )}
          </div>

          {/* Center Logo */}
          <div className="border-t pt-4" style={{ borderColor: "var(--border-color)" }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>🎯 Center Logo (Optional)</h4>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Add a logo or image in the center of the navbar, between the left logo and right navigation links.</p>
            
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(settings.navbar?.show_center_logo as boolean) || false}
                  onChange={(e) => updateSetting("navbar", "show_center_logo", String(e.target.checked))}
                  className="w-4 h-4 rounded" />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>Show Center Logo</span>
              </label>
            </div>

            {(settings.navbar?.show_center_logo as boolean) && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Center Logo Image URL</label>
                  <input type="url" value={(settings.navbar?.center_logo_url as string) || ""} onChange={(e) => updateSetting("navbar", "center_logo_url", e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                    placeholder="https://... or upload below" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Or Upload Center Logo</label>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
                    style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
                    📁 Upload Center Logo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => updateSetting("navbar", "center_logo_url", reader.result as string);
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                </div>
                {(settings.navbar?.center_logo_url as string) && (
                  <div className="mt-2 p-4 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-primary)", border: "1px dashed var(--border-color)" }}>
                    <img src={settings.navbar.center_logo_url as string} alt="Center logo preview" className="h-16 w-auto" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colors */}
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

      {/* Contact Settings */}
      {activeTab === "contact" && (
        <div className="card space-y-4">
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>💬 Contact & Feedback Settings</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Customize the floating contact button that appears on your website
          </p>

          {/* Show/Hide Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg-primary)" }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={(settings.contact?.show_contact as boolean) !== false}
                onChange={(e) => updateSetting("contact", "show_contact", String(e.target.checked))}
                className="w-4 h-4 rounded" />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Show Contact Button</span>
            </label>
          </div>

          {/* Contact Person */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Contact Name</label>
              <input type="text" value={(settings.contact?.contact_name as string) || ""} onChange={(e) => updateSetting("contact", "contact_name", e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                placeholder="Krishnabhadran" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Title / Role</label>
              <input type="text" value={(settings.contact?.contact_title as string) || ""} onChange={(e) => updateSetting("contact", "contact_title", e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                placeholder="Developer & Creator" />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Instagram Username</label>
            <input type="text" value={(settings.contact?.instagram_username as string) || ""} onChange={(e) => updateSetting("contact", "instagram_username", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="@krishnabhadran" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Instagram Profile URL</label>
            <input type="url" value={(settings.contact?.instagram_url as string) || ""} onChange={(e) => updateSetting("contact", "instagram_url", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="https://instagram.com/krishnabhadran" />
          </div>

          {/* Messages */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Welcome Message</label>
            <input type="text" value={(settings.contact?.welcome_message as string) || ""} onChange={(e) => updateSetting("contact", "welcome_message", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="Found a bug or have suggestions?" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Feedback Placeholder Text</label>
            <input type="text" value={(settings.contact?.feedback_placeholder as string) || ""} onChange={(e) => updateSetting("contact", "feedback_placeholder", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="Tell us what you think..." />
          </div>

          {/* Preview */}
          <div className="border-t pt-4" style={{ borderColor: "var(--border-color)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</p>
            <div className="rounded-xl p-4" style={{ background: "var(--bg-primary)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
                  <span className="text-white text-lg">📷</span>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{String(settings.contact?.contact_name || "Name")}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{String(settings.contact?.contact_title || "Title")}</p>
                  <span className="text-xs font-medium" style={{ color: "var(--accent-primary)" }}>{String(settings.contact?.instagram_username || "@username")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
