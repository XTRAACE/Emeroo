"use client";

import type { ContentBlock } from "@/lib/types";
import { extractYoutubeId } from "@/lib/supabase/data";

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

export default function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-6">
      {blocks
        .filter((block) => block.published)
        .sort((a, b) => a.display_order - b.display_order)
        .map((block) => (
          <ContentBlockItem key={block.id} block={block} />
        ))}
    </div>
  );
}

function ContentBlockItem({ block }: { block: ContentBlock }) {
  const content = typeof block.content === "object" && block.content !== null
    ? block.content as Record<string, string>
    : {};

  switch (block.block_type) {
    case "heading":
      return (
        <h2
          className="section-title"
          style={{ textAlign: block.alignment as "left" | "center" | "right" || "center" }}
        >
          {content.text || "Untitled"}
        </h2>
      );

    case "paragraph":
      return (
        <p
          className="text-base leading-relaxed max-w-3xl"
          style={{
            color: "var(--text-secondary)",
            textAlign: block.alignment as "left" | "center" | "right" || "left",
          }}
        >
          {content.text || ""}
        </p>
      );

    case "image":
      return (
        <div className={`flex ${block.alignment === "center" ? "justify-center" : block.alignment === "right" ? "justify-end" : "justify-start"}`}>
          <img
            src={block.media_url || content.url || ""}
            alt={content.alt || "Image"}
            className="rounded-2xl max-w-full shadow-md"
            style={{ maxWidth: block.width === "full" ? "100%" : block.width || "100%" }}
          />
        </div>
      );

    case "youtube_video":
      const videoId = extractYoutubeId(block.youtube_url || content.url || "");
      return videoId ? (
        <div className="aspect-video max-w-3xl mx-auto">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full rounded-2xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={content.title || "YouTube video"}
          />
        </div>
      ) : null;

    case "button":
      return (
        <div className={`flex ${block.alignment === "center" ? "justify-center" : block.alignment === "right" ? "justify-end" : "justify-start"}`}>
          <a href={content.href || "#"} className="btn-primary">
            {content.text || "Click here"}
          </a>
        </div>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 pl-6 py-2 max-w-2xl" style={{ borderColor: "var(--accent-blue)" }}>
          <p className="text-lg italic" style={{ color: "var(--text-secondary)" }}>
            &ldquo;{content.text || ""}&rdquo;
          </p>
          {content.author && (
            <cite className="text-sm mt-2 block not-italic" style={{ color: "var(--text-muted)" }}>
              — {content.author}
            </cite>
          )}
        </blockquote>
      );

    case "card":
      return (
        <div className="card">
          {content.icon && <div className="text-2xl mb-2">{content.icon}</div>}
          {content.title && (
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {content.title}
            </h3>
          )}
          {content.text && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {content.text}
            </p>
          )}
        </div>
      );

    default:
      return (
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {content.text || JSON.stringify(content)}
        </div>
      );
  }
}
