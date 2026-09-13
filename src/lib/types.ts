// Database types for EMERO website

export interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  page_id: string;
  title: string;
  slug: string;
  section_type: string;
  content: Record<string, unknown> | null;
  display_order: number;
  pinned: boolean;
  published: boolean;
  show_in_navbar: boolean;
  navbar_label: string;
  navbar_order: number;
  navbar_enabled: boolean;
  navbar_important: boolean;
  title_color: string | null;
  title_alignment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  section_id: string;
  block_type: BlockType;
  content: Record<string, unknown>;
  media_url: string | null;
  youtube_url: string | null;
  display_order: number;
  width: "full" | "half" | "third" | "quarter";
  alignment: "left" | "center" | "right";
  padding: string;
  row_id: string | null;
  columns: number;
  metadata: Record<string, unknown> | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type BlockType =
  | "heading"
  | "paragraph"
  | "rich_text"
  | "image"
  | "image_gallery"
  | "youtube_video"
  | "button"
  | "card"
  | "icon"
  | "statistics"
  | "quote"
  | "profile"
  | "scenario_card"
  | "solution_card"
  | "timeline_item"
  | "prototype_screen"
  | "feedback_card"
  | "survey_result"
  | "custom_html"
  | "spacer"
  | "divider";

export interface PrototypeScreen {
  id: string;
  title: string;
  description: string;
  detailed_description: string;
  image_url: string;
  category: string;
  display_order: number;
  pinned: boolean;
  published: boolean;
  youtube_url: string | null;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: string;
  image_url: string;
  title: string;
  description: string;
  category: string;
  display_order: number;
  published: boolean;
  created_at: string;
}

export interface Video {
  id: string;
  youtube_url: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  display_order: number;
  pinned: boolean;
  published: boolean;
  created_at: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  response: string;
  image_url: string | null;
  audio_url: string | null;
  youtube_url: string | null;
  category: string;
  published: boolean;
  created_at: string;
  document_url: string | null;
  graph_data: {
    chart_type: string;
    title: string;
    labels: string[];
    values: number[];
    colors: string[];
  } | null;
  documents: { url: string; name: string }[] | string | null;
  videos: { url: string; title: string }[] | string | null;
  audios: { url: string; label: string }[] | string | null;
}

export interface Feedback {
  id: string;
  person_name: string;
  photo_url: string | null;
  role: string;
  description: string;
  feedback_text: string;
  audio_url: string | null;
  youtube_url: string | null;
  display_order: number;
  published: boolean;
  category: string;
  created_at: string;
}

export interface Contributor {
  id: string;
  name: string;
  photo_url: string | null;
  contribution: string;
  description: string;
  display_order: number;
  published: boolean;
  created_at: string;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  group: string;
  group_name: string;
  display_order: number;
  enabled: boolean;
}

// Admin user type
export interface AdminUser {
  id: string;
  email: string;
  is_admin: boolean;
}

// Combined section with blocks
export interface SectionWithBlocks extends Section {
  blocks: ContentBlock[];
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
