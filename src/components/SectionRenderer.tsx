import type { SectionWithBlocks } from "@/lib/types";
import ContentBlockRenderer from "./ContentBlockRenderer";

interface SectionRendererProps {
  section: SectionWithBlocks;
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  return (
    <section id={section.slug} className="py-20">
      <div className="section-container">
        <ContentBlockRenderer blocks={section.blocks || []} />
      </div>
    </section>
  );
}
