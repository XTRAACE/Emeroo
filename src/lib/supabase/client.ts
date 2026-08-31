import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    supabaseUrl.startsWith("http")
);

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

/**
 * Helper: get the current user's session, or null if not authenticated.
 * Use this before any admin write operation to verify auth.
 */
export async function getAdminSession() {
  const sb = getSupabaseClient();
  const { data, error } = await sb.auth.getSession();
  if (error) {
    console.error("Auth session error:", error.message);
    return null;
  }
  return data.session;
}

/**
 * Helper: check if the current user is an admin.
 */
export async function isAdminUser(): Promise<boolean> {
  const session = await getAdminSession();
  if (!session) return false;

  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("admin_profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (error || !data) return false;
  return data.is_admin === true;
}
