"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase/client";

interface FooterLink {
  label: string;
  href: string;
  group?: string;
}

interface FooterSettings {
  copyright?: string;
  tagline?: string;
}

export default function Footer({ links = [] }: { links?: FooterLink[] }) {
  const { theme, toggleTheme } = useTheme();
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const sb = getSupabaseClient();
        const { data } = await sb.from("site_settings").select("value").eq("id", "footer").single();
        if (data?.value) setFooterSettings(data.value as FooterSettings);
      } catch (err) {
        console.error("Failed to load footer settings:", err);
      }
    };
    loadSettings();
  }, []);

  const grouped: Record<string, FooterLink[]> = {};
  links.forEach((l) => {
    const g = l.group || "general";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(l);
  });

  return (
    <footer className="py-12 border-t" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: "var(--gradient-primary)" }}>
                E
              </div>
              <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>EMERO</span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Intelligent Emergency Response Technology
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h4 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>{group}</h4>
              <div className="space-y-2">
                {items.map((link) => (
                  <a key={`${link.label}-${link.href}`} href={link.href} className="block text-sm transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "var(--border-color)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {footerSettings.copyright || "© 2025 EMERO. All rights reserved."}
          </p>
          <button onClick={toggleTheme} className="text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>
    </footer>
  );
}
