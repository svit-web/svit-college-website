// Admin write for the homepage section order. Runs in the browser with the
// admin's session; app_settings' RLS only lets global admins write a row with
// no admin_section_id, which is what this upsert creates. The browser client
// revalidates the public site after writes.
import { createClient } from "@/app/lib/supabase/client";
import {
  HOMEPAGE_LAYOUT_KEY,
  parseHomepageLayout,
  type HomepageLayoutEntry,
} from "@/lib/homepage-layout";

export async function saveHomepageLayout(
  layout: HomepageLayoutEntry[],
  userId: string,
): Promise<HomepageLayoutEntry[]> {
  const payload = parseHomepageLayout(layout);
  const { data, error } = await createClient()
    .from("app_settings")
    .upsert({
      key: HOMEPAGE_LAYOUT_KEY,
      value: payload as any,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .select("key");
  if (error) throw new Error(error.message);
  // RLS rejects a non-global-admin upsert by returning no rows rather than an error.
  if (!data?.length) throw new Error("Only global admins can change the homepage layout.");
  return payload;
}
