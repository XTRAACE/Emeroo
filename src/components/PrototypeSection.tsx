"use client";

import { useState } from "react";

interface Screen {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  youtube_url: string | null;
  audio_url: string | null;
  category: string;
}

export default function PrototypeSection({ screens = [] }: { screens?: Screen[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section id="prototype" className="py-20 sm:py-28" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">
            <span>📱</span> Prototype Showcase
          </div>
          <h2 className="section-title max-w-4xl mx-auto mb-4">
            See the <span className="gradient-text">EMERO App</span>
          </h2>
          <p className="section-subtitle">
            Explore the prototype screens and see how EMERO works in practice.
          </p>
        </div>

        {screens.length > 0 ? (
          <div className="max-w-5xl mx-auto">
            {/* Screen selector */}
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {screens.map((screen, i) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveIdx(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeIdx === i ? "text-white" : ""
                  }`}
                  style={{
                    background: activeIdx === i ? "var(--gradient-primary)" : "var(--bg-card)",
                    color: activeIdx === i ? "#ffffff" : "var(--text-secondary)",
                    border: activeIdx === i ? "none" : "1px solid var(--border-color)",
                  }}
                >
                  {screen.title}
                </button>
              ))}
            </div>

            {/* Active screen display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Phone mockup */}
              <div className="phone-mockup mx-auto">
                <div className="phone-notch" />
                <div className="phone-screen">
                  {screens[activeIdx]?.image_url ? (
                    <img
                      src={screens[activeIdx].image_url}
                      alt={screens[activeIdx].title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
                      <div className="text-center p-4">
                        <div className="text-4xl mb-2">📱</div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {screens[activeIdx]?.title || "Prototype Screen"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Screen info */}
              <div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                  {screens[activeIdx]?.title}
                </h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                  {screens[activeIdx]?.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(220,38,38,0.1)", color: "var(--accent-primary)" }}>
                    {screens[activeIdx]?.category}
                  </span>
                </div>

                {screens[activeIdx]?.youtube_url && (
                  <div className="mt-6 rounded-xl overflow-hidden">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${screens[activeIdx].youtube_url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] || ""}`}
                        className="w-full h-full"
                        allowFullScreen
                        title={screens[activeIdx].title}
                      />
                    </div>
                  </div>
                )}

                {screens[activeIdx]?.audio_url && (
                  <div className="mt-4 p-3 rounded-xl" style={{ background: "var(--bg-primary)" }}>
                    <audio controls src={screens[activeIdx].audio_url} className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="phone-mockup mx-auto">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>EMERO Prototype</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Add screens in admin panel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
