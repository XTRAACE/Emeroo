import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import VideoHeroSection from "@/components/VideoHeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import MapSection from "@/components/MapSection";
import PrototypeSection from "@/components/PrototypeSection";
import { EmergencyResponderSection, HospitalSection, GlobalSOSSection } from "@/components/EmergencySections";
import VerificationSection from "@/components/VerificationSection";
import TimelineSection from "@/components/TimelineSection";
import ResearchSection from "@/components/ResearchSection";
import { GallerySection, YouTubeSection } from "@/components/GallerySection";
import FeedbackSection from "@/components/FeedbackSection";
import ContributorsSection from "@/components/ContributorsSection";
import ThankYouSection from "@/components/ThankYouSection";
import {
  checkSupabase,
  getNavbarItems,
  getPrototypeScreens,
  getGalleryItems,
  getVideos,
  getSurveys,
  getFeedback,
  getContributors,
  getFooterLinks,
  getSiteSettings,
} from "@/lib/supabase/data";

export default async function HomePage() {
  let navbarItems: { label: string; href: string }[] = [];
  let screens: Awaited<ReturnType<typeof getPrototypeScreens>> = [];
  let galleryItems: Awaited<ReturnType<typeof getGalleryItems>> = [];
  let videos: Awaited<ReturnType<typeof getVideos>> = [];
  let surveys: Awaited<ReturnType<typeof getSurveys>> = [];
  let feedbackItems: Awaited<ReturnType<typeof getFeedback>> = [];
  let contributors: Awaited<ReturnType<typeof getContributors>> = [];
  let footerLinks: Awaited<ReturnType<typeof getFooterLinks>> = [];
  let heroSettings: Record<string, unknown> | null = null;

  try {
    if (checkSupabase()) {
      const [
        navItems,
        screensData,
        galleryData,
        videosData,
        surveysData,
        feedbackData,
        contributorsData,
        footerData,
        heroData,
      ] = await Promise.all([
        getNavbarItems(),
        getPrototypeScreens(),
        getGalleryItems(),
        getVideos(),
        getSurveys(),
        getFeedback(),
        getContributors(),
        getFooterLinks(),
        getSiteSettings("hero"),
      ]);

      navbarItems = navItems.map((item) => ({
        label: item.label,
        href: item.href,
      }));
      screens = screensData;
      galleryItems = galleryData;
      videos = videosData;
      surveys = surveysData;
      feedbackItems = feedbackData;
      contributors = contributorsData;
      footerLinks = footerData;
      heroSettings = heroData;
    }
  } catch (err) {
    console.error("Failed to load Supabase data:", err);
  }

  const defaultNavItems = [
    { label: "Explanation", href: "#solution" },
    { label: "Working", href: "#how-it-works" },
    { label: "Prototype", href: "#prototype" },
    { label: "Survey", href: "#research" },
    { label: "Feedbacks", href: "#feedback" },
    { label: "Challenge", href: "#challenge" },
    { label: "Journey", href: "#journey" },
  ];

  const finalNavItems = navbarItems.length > 0 ? navbarItems : defaultNavItems;

  const defaultFooterLinks = [
    { label: "Challenge", href: "#challenge", group: "Explore" },
    { label: "Prototype", href: "#prototype", group: "Explore" },
    { label: "Journey", href: "#journey", group: "Explore" },
    { label: "About", href: "#value", group: "Explore" },
  ];

  const finalFooterLinks =
    footerLinks.length > 0
      ? footerLinks.map((l) => ({
          label: l.label,
          href: l.href,
          group: l.group_name || l.group || "general",
        }))
      : defaultFooterLinks;

  return (
    <main className="min-h-screen">
      <Navbar items={finalNavItems} />
      <HeroSection settings={heroSettings as Record<string, string> | undefined} />
      <VideoHeroSection videos={videos} />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <MapSection />
      <EmergencyResponderSection />
      <GlobalSOSSection />
      <HospitalSection />
      <PrototypeSection screens={screens} />
      <VerificationSection />
      <TimelineSection />
      <ResearchSection surveys={surveys} />
      <GallerySection items={galleryItems} />
      <YouTubeSection videos={videos} />
      <FeedbackSection feedback={feedbackItems} />
      <ContributorsSection contributors={contributors} />
      <ThankYouSection />
      <Footer links={finalFooterLinks} />
    </main>
  );
}
