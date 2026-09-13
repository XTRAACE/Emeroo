import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import VideoHeroSection from "@/components/VideoHeroSection";
import DynamicSection from "@/components/DynamicSection";
import PrototypeSection from "@/components/PrototypeSection";
import ResearchSection from "@/components/ResearchSection";
import FeedbackSection from "@/components/FeedbackSection";
import { GallerySection } from "@/components/GallerySection";
import ContributorsSection from "@/components/ContributorsSection";
import ContactButton from "@/components/ContactButton";
import {
  checkSupabase,
  getNavbarItems,
  getPrototypeScreens,
  getVideos,
  getSurveys,
  getGalleryItems,
  getFeedback,
  getContributors,
  getFooterLinks,
  getSiteSettings,
  getAllSectionsWithBlocks,
} from "@/lib/supabase/data";

// Force dynamic so deletions/edits reflect immediately (no caching)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let navbarItems: { label: string; href: string }[] = [];
  let screens: Awaited<ReturnType<typeof getPrototypeScreens>> = [];
  let videos: Awaited<ReturnType<typeof getVideos>> = [];
  let surveys: Awaited<ReturnType<typeof getSurveys>> = [];
  let feedbackItems: Awaited<ReturnType<typeof getFeedback>> = [];
  let galleryItems: Awaited<ReturnType<typeof getGalleryItems>> = [];
  let contributors: Awaited<ReturnType<typeof getContributors>> = [];
  let footerLinks: Awaited<ReturnType<typeof getFooterLinks>> = [];
  let heroSettings: Record<string, unknown> | null = null;
  let dynamicSections: Awaited<ReturnType<typeof getAllSectionsWithBlocks>> = [];

  try {
    if (checkSupabase()) {
      const results = await Promise.all([
        getNavbarItems(),
        getPrototypeScreens(),
        getVideos(),
        getSurveys(),
        getGalleryItems(),
        getFeedback(),
        getContributors(),
        getFooterLinks(),
        getSiteSettings("hero"),
        getAllSectionsWithBlocks(),
      ]);

      navbarItems = results[0].map((item) => ({
        label: item.label,
        href: item.href,
      }));
      screens = results[1];
      videos = results[2];
      surveys = results[3];
      galleryItems = results[4];
      feedbackItems = results[5];
      contributors = results[6];
      footerLinks = results[7];
      heroSettings = results[8];
      dynamicSections = results[9];
    }
  } catch (err) {
    console.error("Failed to load Supabase data:", err);
  }

  const defaultNavItems = [
    { label: "Introduction", href: "#hero" },
    { label: "Prototype", href: "#prototype" },
    { label: "Survey", href: "#research" },
    { label: "Feedbacks", href: "#feedback" },
    { label: "Contributors", href: "#contributors" },
  ];

  const finalNavItems = navbarItems.length > 0 ? navbarItems : defaultNavItems;

  const finalFooterLinks =
    footerLinks.length > 0
      ? footerLinks.map((l) => ({
          label: l.label,
          href: l.href,
          group: l.group_name || l.group || "general",
        }))
      : [
          { label: "Prototype", href: "#prototype", group: "Explore" },
          { label: "Survey", href: "#research", group: "Explore" },
          { label: "Feedback", href: "#feedback", group: "Explore" },
        ];

  return (
    <main className="min-h-screen">
      <Navbar items={finalNavItems} />

      {/* Hero - always shown */}
      <div id="hero">
        <HeroSection settings={heroSettings as Record<string, string> | undefined} />
      </div>

      {/* Videos - only if videos exist */}
      {videos.length > 0 && <VideoHeroSection videos={videos} />}

      {/* Dynamic sections from admin (any custom sections with content blocks) */}
      {dynamicSections.map((section) => {
        // Skip sections that are handled by dedicated components
        const reservedSlugs = [
          "prototype", "research", "survey", "feedback",
          "contributors", "hero", "video", "gallery",
        ];
        if (reservedSlugs.includes(section.slug)) return null;

        return (
          <DynamicSection
            key={section.id}
            id={section.id}
            title={section.title}
            slug={section.slug}
            blocks={section.blocks}
            titleColor={section.title_color}
            titleAlignment={section.title_alignment}
          />
        );
      })}

      {/* Prototype - only if screens exist */}
      {screens.length > 0 && <PrototypeSection screens={screens} />}

      {/* Gallery - only if gallery items exist */}
      {galleryItems.length > 0 && <GallerySection items={galleryItems} />}

      {/* Survey/Research - only if surveys exist */}
      {surveys.length > 0 && <ResearchSection surveys={surveys} />}

      {/* Feedback - only if feedback exists */}
      {feedbackItems.length > 0 && <FeedbackSection feedback={feedbackItems} />}

      {/* Contributors - only if contributors exist */}
      {contributors.length > 0 && <ContributorsSection contributors={contributors} />}

      <Footer links={finalFooterLinks} />
      <ContactButton />
    </main>
  );
}
