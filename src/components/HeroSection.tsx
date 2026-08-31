"use client";

import { useState } from "react";

interface HeroSectionProps {
  settings?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    cta_primary?: string;
    cta_secondary?: string;
    video_url?: string;
  };
}

const defaults = {
  title: "When Every Second Matters, EMERO Connects the Response.",
  subtitle: "EMERO is an intelligent emergency-response platform designed to connect people, emergency vehicles, hospitals and responders through real-time coordination, location intelligence and AI-assisted decision support.",
  badge: "Emergency Response Technology",
  cta_primary: "Explore EMERO",
  cta_secondary: "See How It Works",
  video_url: "",
};

export default function HeroSection({ settings }: HeroSectionProps) {
  const s = { ...defaults, ...settings };
  const [videoError, setVideoError] = useState(false);
  const hasVideo = s.video_url && !videoError;

  return (
    <section className="relative h-screen overflow-hidden">
      {/* ── Video Background (full screen) ── */}
      {hasVideo && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoError(true)}
          >
            <source src={s.video_url} />
          </video>
          {/* Gradient overlay so text stays readable */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)"
          }} />
        </div>
      )}

      {/* ── Gradient Background (fallback when no video) ── */}
      {!hasVideo && (
        <div className="absolute inset-0 z-0" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(234,88,12,0.2) 0%, transparent 50%)"
            }} />
        </div>
      )}

      {/* ── Content: centered X, pushed to bottom Y ── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        <div className="section-container pb-16 sm:pb-20 lg:pb-24 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-5 backdrop-blur-sm"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#fca5a5",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {s.badge}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight max-w-5xl mx-auto mb-4"
            style={{ color: "#ffffff", lineHeight: 1.1, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
            {s.title.split("EMERO").length > 1 ? (
              <>
                {s.title.split("EMERO")[0]}
                <span style={{ color: "#ffffff", textShadow: "0 0 40px rgba(220,38,38,0.6)" }}>EMERO</span>
                {s.title.split("EMERO").slice(1).join("EMERO")}
              </>
            ) : (
              s.title
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-6"
            style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
            {s.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <a href="#solution" className="btn-primary text-base px-7 py-3">
              {s.cta_primary}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a href="#prototype"
              className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            >
              {s.cta_secondary}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Status indicators */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <StatusCard label="Emergency Network" status="ACTIVE" />
            <StatusCard label="Location Services" status="ACTIVE" />
            <StatusCard label="Hospital Network" status="CONNECTED" />
            <StatusCard label="Response Monitoring" status="ACTIVE" />
          </div>

          <p className="mt-4 text-[10px] sm:text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Demonstration / prototype states — not real emergency infrastructure
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-5 h-5" style={{ color: "rgba(255,255,255,0.4)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

function StatusCard({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm"
      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      <div className="text-left">
        <div className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</div>
        <div className="text-xs font-bold" style={{ color: "#ffffff" }}>{status}</div>
      </div>
    </div>
  );
}
