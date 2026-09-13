import { createServerClient } from "./server";
import type {
  Page,
  Section,
  ContentBlock,
  PrototypeScreen,
  Gallery,
  Video,
  Survey,
  Feedback,
  Contributor,
  FooterLink,
  SectionWithBlocks,
} from "../types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    supabaseUrl.startsWith("http")
);

export function checkSupabase(): boolean {
  return isSupabaseConfigured;
}

function getDb() {
  return createServerClient();
}

// ---- Site Settings ----
export async function getSiteSettings(id: string): Promise<Record<string, unknown> | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await getDb().from("site_settings").select("value").eq("id", id).single();
    return (data?.value as Record<string, unknown>) || null;
  } catch {
    return null;
  }
}

// ---- Pages ----
export async function getPages(): Promise<Page[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("pages")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });
  return (data as Page[]) || [];
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await getDb()
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return (data as Page) || null;
}

// ---- Sections ----
export async function getSectionsByPage(pageId: string): Promise<Section[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("sections")
    .select("*")
    .eq("page_id", pageId)
    .eq("published", true)
    .order("display_order", { ascending: true });
  return (data as Section[]) || [];
}

export async function getSectionsWithBlocks(pageId: string): Promise<SectionWithBlocks[]> {
  if (!isSupabaseConfigured) return [];
  const sections = await getSectionsByPage(pageId);
  const sectionsWithBlocks: SectionWithBlocks[] = [];

  for (const section of sections) {
    const { data: blocks } = await getDb()
      .from("content_blocks")
      .select("*")
      .eq("section_id", section.id)
      .eq("published", true)
      .order("display_order", { ascending: true });

    sectionsWithBlocks.push({
      ...section,
      blocks: (blocks as ContentBlock[]) || [],
    });
  }

  return sectionsWithBlocks;
}

// ---- Navbar Items ----
export interface NavbarItem {
  label: string;
  href: string;
  order: number;
  important: boolean;
}

export async function getNavbarItems(): Promise<NavbarItem[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("sections")
    .select("navbar_label, slug, navbar_order, navbar_important, show_in_navbar, navbar_enabled")
    .eq("show_in_navbar", true)
    .eq("navbar_enabled", true)
    .eq("published", true)
    .order("navbar_order", { ascending: true });

  if (!data) return [];

  return data.map((item: Record<string, unknown>) => ({
    label: (item.navbar_label as string) || "",
    href: `#${item.slug as string}`,
    order: (item.navbar_order as number) || 0,
    important: (item.navbar_important as boolean) || false,
  }));
}

// ---- Content Blocks ----
export async function getContentBlocks(sectionId: string): Promise<ContentBlock[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("content_blocks")
    .select("*")
    .eq("section_id", sectionId)
    .eq("published", true)
    .order("display_order", { ascending: true });
  return (data as ContentBlock[]) || [];
}

// ---- Prototype Screens ----
export async function getPrototypeScreens(): Promise<PrototypeScreen[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("prototype_screens")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  return (data as PrototypeScreen[]) || [];
}

// ---- Gallery ----
export async function getGalleryItems(): Promise<Gallery[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("gallery")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  return (data as Gallery[]) || [];
}

// ---- Videos ----
export async function getVideos(): Promise<Video[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("videos")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  return (data as Video[]) || [];
}

// ---- Surveys ----
export async function getSurveys(): Promise<Survey[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("surveys")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data as Survey[]) || [];
}

// ---- Feedback ----
export async function getFeedback(): Promise<Feedback[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("feedback")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  return (data as Feedback[]) || [];
}

// ---- Contributors ----
export async function getContributors(): Promise<Contributor[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("contributors")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  return (data as Contributor[]) || [];
}

// ---- Dynamic Sections with Blocks ----
export async function getAllSectionsWithBlocks(): Promise<SectionWithBlocks[]> {
  if (!isSupabaseConfigured) return [];
  const { data: sections, error } = await getDb()
    .from("sections")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (error || !sections) return [];

  const result: SectionWithBlocks[] = [];
  for (const section of sections as Section[]) {
    const { data: blocks } = await getDb()
      .from("content_blocks")
      .select("*")
      .eq("section_id", section.id)
      .eq("published", true)
      .order("display_order", { ascending: true });
    result.push({
      ...section,
      blocks: (blocks as ContentBlock[]) || [],
    });
  }
  return result;
}

// ---- Footer Links ----
export async function getFooterLinks(): Promise<FooterLink[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await getDb()
    .from("footer_links")
    .select("*")
    .eq("enabled", true)
    .order("display_order", { ascending: true });
  return (data as FooterLink[]) || [];
}

// ---- Extract YouTube ID ----
export function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
}
