"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface ContactSettings {
  instagram_url: string;
  instagram_username: string;
  contact_name: string;
  contact_title: string;
  welcome_message: string;
  feedback_placeholder: string;
  show_contact: boolean;
}

const defaultSettings: ContactSettings = {
  instagram_url: "https://instagram.com/krishnabhadran",
  instagram_username: "@krishnabhadran",
  contact_name: "Krishnabhadran",
  contact_title: "Developer & Creator",
  welcome_message: "Found a bug or have suggestions?",
  feedback_placeholder: "Tell us what you think, report bugs, or suggest features...",
  show_contact: true,
};

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const sb = getSupabaseClient();
        const { data } = await sb.from("site_settings").select("value").eq("id", "contact").single();
        if (data?.value) {
          setSettings({ ...defaultSettings, ...data.value } as ContactSettings);
        }
      } catch (err) {
        console.error("Failed to load contact settings:", err);
      }
    };
    loadSettings();
  }, []);

  if (!settings.show_contact) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{ background: "var(--gradient-primary)" }}
        title="Contact & Feedback"
        aria-label="Contact and Feedback"
      >
        <span className="text-xl sm:text-2xl">{isOpen ? "✕" : "💬"}</span>
      </button>

      {/* Contact Panel - full width on mobile, card on desktop */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:bottom-24 sm:right-5 sm:left-auto sm:w-80 z-50 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          {/* Header */}
          <div className="p-4" style={{ background: "var(--gradient-primary)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">💬 Contact & Feedback</h3>
                <p className="text-white/80 text-sm mt-1">{settings.welcome_message}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 sm:hidden" aria-label="Close">
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 overflow-y-auto sm:overflow-visible" style={{ maxHeight: "calc(85vh - 100px)" }}>
            {/* Instagram Contact */}
            <div className="rounded-xl p-3" style={{ background: "var(--bg-primary)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
                  <span className="text-white text-lg">📷</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{settings.contact_name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{settings.contact_title}</p>
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {settings.instagram_username} →
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Feedback Form */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                Quick Feedback
              </label>
              <textarea
                id="feedback-text"
                placeholder={settings.feedback_placeholder}
                className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                rows={3}
                style={{ border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Send Button */}
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                const textarea = document.getElementById("feedback-text") as HTMLTextAreaElement;
                const message = textarea?.value || "Hi! I have feedback about the project.";
                const url = `https://instagram.com/direct/new/?text=${encodeURIComponent(message)}`;
                window.open(url, "_blank");
              }}
              className="block w-full py-2.5 text-center text-white font-medium rounded-xl transition-all hover:opacity-90 active:scale-98"
              style={{ background: "var(--gradient-primary)" }}
            >
              📨 Send via Instagram
            </a>

            {/* Alternative */}
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              Or DM directly on Instagram
            </p>
          </div>
        </div>
      )}
    </>
  );
}
