"use client";

import type { ContentBlock } from "@/lib/types";

function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
}

interface DynamicSectionProps {
  id?: string;
  title: string;
  slug?: string;
  blocks: ContentBlock[];
  titleColor?: string | null;
  titleAlignment?: string | null;
}

export default function DynamicSection({ id, title, slug, blocks = [], titleColor, titleAlignment }: DynamicSectionProps) {
  const publishedBlocks = blocks
    .filter((b) => b.published)
    .sort((a, b) => a.display_order - b.display_order);

  // Group blocks into rows
  const rows: { rowId: string; blocks: ContentBlock[]; columns: number }[] = [];
  const standaloneBlocks: ContentBlock[] = [];

  publishedBlocks.forEach((block) => {
    if (block.row_id) {
      let existingRow = rows.find((r) => r.rowId === block.row_id);
      if (!existingRow) {
        existingRow = { rowId: block.row_id, blocks: [], columns: block.columns || 2 };
        rows.push(existingRow);
      }
      existingRow.blocks.push(block);
      // Use the max columns value from blocks in this row
      if (block.columns && block.columns > existingRow.columns) {
        existingRow.columns = block.columns;
      }
    } else {
      standaloneBlocks.push(block);
    }
  });

  // Interleave rows and standalone blocks in display_order
  const allItems: ({ type: "row"; row: typeof rows[0] } | { type: "block"; block: ContentBlock })[] = [];
  rows.forEach((row) => {
    const minOrder = Math.min(...row.blocks.map((b) => b.display_order));
    allItems.push({ type: "row", row });
    // Store the order for sorting
    (allItems[allItems.length - 1] as Record<string, unknown>)._order = minOrder;
  });
  standaloneBlocks.forEach((block) => {
    allItems.push({ type: "block", block });
    (allItems[allItems.length - 1] as Record<string, unknown>)._order = block.display_order;
  });
  allItems.sort((a, b) => ((a as Record<string, unknown>)._order as number) - ((b as Record<string, unknown>)._order as number));

  return (
    <section
      id={slug || id}
      className="py-16 sm:py-20"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="section-container">
        <div className="text-center mb-10">
          <h2 className="section-title max-w-4xl mx-auto"
            style={{
              color: titleColor || undefined,
              textAlign: (titleAlignment as "left" | "center" | "right") || "center",
            }}>
            {title}
          </h2>
        </div>

        {publishedBlocks.length > 0 ? (
          <div className="max-w-6xl mx-auto space-y-8">
            {allItems.map((item, idx) => {
              if (item.type === "row") {
                const gridCols = item.row.columns === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
                  item.row.columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
                  item.row.columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1";
                return (
                  <div key={`row-${item.row.rowId}`} className={`grid ${gridCols} gap-6`}>
                    {item.row.blocks.map((block) => (
                      <div key={block.id} className="min-w-0">
                        <BlockRenderer block={block} />
                      </div>
                    ))}
                  </div>
                );
              }
              return <BlockRenderer key={item.block.id} block={item.block} />;
            })}
          </div>
        ) : (
          <p className="text-center" style={{ color: "var(--text-muted)" }}>
            Add content blocks in the admin panel to populate this section.
          </p>
        )}
      </div>
    </section>
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  const content = (
    typeof block.content === "object" && block.content !== null
      ? (block.content as Record<string, string>)
      : {}
  );

  const alignClass =
    block.alignment === "center"
      ? "text-center mx-auto"
      : block.alignment === "right"
      ? "text-right ml-auto"
      : "text-left";

  const widthStyle =
    block.width === "half"
      ? { maxWidth: "50%" }
      : block.width === "third"
      ? { maxWidth: "33%" }
      : {};

  switch (block.block_type) {
    case "heading":
      return (
        <h3
          className={`text-2xl sm:text-3xl font-bold ${alignClass}`}
          style={{ color: "var(--text-primary)", ...widthStyle }}
        >
          {content.text || "Untitled Heading"}
        </h3>
      );

    case "paragraph":
      return (
        <div className={alignClass} style={widthStyle}>
          <p
            className="text-base leading-relaxed whitespace-pre-line"
            style={{ color: "var(--text-secondary)" }}
          >
            {content.text || ""}
          </p>
        </div>
      );

    case "image": {
      const src = block.media_url || content.url || "";
      if (!src) return null;
      return (
        <div className={`${alignClass}`} style={widthStyle}>
          <img
            src={src}
            alt={content.alt || "Image"}
            className="rounded-2xl max-w-full shadow-md mx-auto"
            style={{ maxWidth: block.width === "full" ? "100%" : widthStyle.maxWidth || "100%" }}
          />
          {content.caption && (
            <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>
              {content.caption}
            </p>
          )}
        </div>
      );
    }

    case "youtube_video": {
      const url = block.youtube_url || content.url || "";
      const videoId = extractYoutubeId(url);
      if (!videoId) return null;
      return (
        <div className={`max-w-3xl ${alignClass === "text-center mx-auto" ? "mx-auto" : alignClass === "text-right ml-auto" ? "ml-auto" : ""}`}>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={content.title || "YouTube video"}
            />
          </div>
          {content.title && (
            <p className="text-sm mt-2 font-medium" style={{ color: "var(--text-secondary)" }}>
              {content.title}
            </p>
          )}
        </div>
      );
    }

    case "card":
      return (
        <div className="card" style={widthStyle}>
          {content.icon && <div className="text-3xl mb-3">{content.icon}</div>}
          {content.title && (
            <h4 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {content.title}
            </h4>
          )}
          {content.text && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {content.text}
            </p>
          )}
          {(block.media_url || content.image) && (
            <img
              src={block.media_url || content.image}
              alt={content.title || "Card image"}
              className="mt-3 rounded-xl w-full"
            />
          )}
        </div>
      );

    case "quote":
      return (
        <blockquote
          className={`border-l-4 pl-6 py-3 max-w-2xl ${alignClass === "text-center mx-auto" ? "mx-auto border-l-0 border-t-2 pt-4 text-center" : ""}`}
          style={{ borderColor: "var(--accent-primary)" }}
        >
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

    case "button":
      return (
        <div className={alignClass === "text-center mx-auto" ? "text-center" : alignClass === "text-right ml-auto" ? "text-right" : "text-left"}>
          <a
            href={content.href || "#"}
            className="btn-primary inline-flex items-center gap-2"
          >
            {content.text || "Click here"}
          </a>
        </div>
      );

    default:
      return (
        <div className={alignClass} style={widthStyle}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {content.text || JSON.stringify(content)}
          </p>
        </div>
      );
  }
}
