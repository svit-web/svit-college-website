// Public/admin read for the homepage section order (app_settings key
// `homepage_layout`). Writes live in homepage-layout-next.ts, gated by
// app_settings' RLS: only global admins can write it.
import { publicSupabase } from "@/lib/supabase-public";
import {
  HOMEPAGE_LAYOUT_KEY,
  parseHomepageLayout,
  type HomepageLayoutEntry,
} from "@/lib/homepage-layout";

export async function getHomepageLayout(): Promise<HomepageLayoutEntry[]> {
  const { data, error } = await publicSupabase()
    .from("app_settings")
    .select("value")
    .eq("key", HOMEPAGE_LAYOUT_KEY)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return parseHomepageLayout(data?.value);
}
