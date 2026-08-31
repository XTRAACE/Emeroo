"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Stats {
  sections: number;
  publishedSections: number;
  prototypeScreens: number;
  galleryItems: number;
  videos: number;
  surveys: number;
  feedback: number;
  contributors: number;
}

const quickActions = [
  { label: "Add Section", href: "/admin/sections", icon: "📐" },
  { label: "Site Settings", href: "/admin/settings", icon: "⚙️" },
  { label: "Add Prototype Screen", href: "/admin/prototype", icon: "📱" },
  { label: "Add Gallery Item", href: "/admin/gallery", icon: "📸" },
  { label: "Add Video", href: "/admin/videos", icon: "🎬" },
  { label: "Add Survey", href: "/admin/surveys", icon: "📋" },
  { label: "Add Feedback", href: "/admin/feedback", icon: "💬" },
  { label: "Add Contributor", href: "/admin/contributors", icon: "👥" },
  { label: "Manage Navbar", href: "/admin/navbar", icon: "🔗" },
  { label: "Manage Pages", href: "/admin/pages", icon: "📄" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    sections: 0, publishedSections: 0, prototypeScreens: 0, galleryItems: 0,
    videos: 0, surveys: 0, feedback: 0, contributors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const sb = getSupabaseClient();
        const [sectionsRes, protoRes, galleryRes, videosRes, surveysRes, feedbackRes, contribRes] = await Promise.all([
          sb.from("sections").select("id, published"),
          sb.from("prototype_screens").select("id", { count: "exact", head: true }),
          sb.from("gallery").select("id", { count: "exact", head: true }),
          sb.from("videos").select("id", { count: "exact", head: true }),
          sb.from("surveys").select("id", { count: "exact", head: true }),
          sb.from("feedback").select("id", { count: "exact", head: true }),
          sb.from("contributors").select("id", { count: "exact", head: true }),
        ]);

        const sections = (sectionsRes.data || []) as { id: string; published: boolean }[];
        setStats({
          sections: sections.length,
          publishedSections: sections.filter((s) => s.published).length,
          prototypeScreens: protoRes.count || 0,
          galleryItems: galleryRes.count || 0,
          videos: videosRes.count || 0,
          surveys: surveysRes.count || 0,
          feedback: feedbackRes.count || 0,
          contributors: contribRes.count || 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Sections", value: stats.sections, color: "#dc2626" },
    { label: "Published", value: stats.publishedSections, color: "#16a34a" },
    { label: "Screens", value: stats.prototypeScreens, color: "#7c3aed" },
    { label: "Gallery", value: stats.galleryItems, color: "#ea580c" },
    { label: "Videos", value: stats.videos, color: "#0891b2" },
    { label: "Surveys", value: stats.surveys, color: "#ca8a04" },
    { label: "Feedback", value: stats.feedback, color: "#059669" },
    { label: "Contributors", value: stats.contributors, color: "#7c3aed" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Website Overview</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="card">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}
              className="card flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "rgba(220,38,38,0.1)" }}>
                {action.icon}
              </div>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-6 text-white" style={{ background: "var(--gradient-primary)" }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold">Preview Your Website</h3>
            <p className="text-white/70 text-sm mt-1">See how your changes look on the live site</p>
          </div>
          <Link href="/" target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors">
            🌐 View Site
          </Link>
        </div>
      </div>
    </div>
  );
}
