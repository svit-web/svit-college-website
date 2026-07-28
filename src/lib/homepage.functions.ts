import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function serverClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (
          (key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) &&
          headers.get("Authorization") === `Bearer ${key}`
        ) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getGlobalHomepageItems = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = serverClient();
    const { data, error } = await supabase
      .from("homepage_items")
      .select(
        "id, item_type, eyebrow, title, title_accent, subtitle, body, image_url, icon_name, link_href, link_label, secondary_link_href, secondary_link_label, sort_order, metadata",
      )
      .eq("scope_type", "global")
      .eq("is_active", true)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
);

export const getCollegesGrid = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = serverClient();
    const { data, error } = await supabase
      .from("colleges")
      .select("slug, code, name, logo_url, sort_order, metadata")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
);

export const getRecruiterLogos = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = serverClient();
    const { data, error } = await supabase
      .from("recruiters")
      .select("company_name, logo_url, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
);

export const getJobListings = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = serverClient();
    const { data, error } = await supabase
      .from("homepage_items")
      .select("id, title, subtitle, body")
      .eq("item_type", "job")
      .eq("is_active", true)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
);

/**
 * Fetch homepage items scoped to a specific college (scope_type = 'college').
 * Returns same shape as getGlobalHomepageItems.
 * Used by college landing pages to get their own stats/why_choose/trust_badges.
 */
export const getCollegeHomepageItems = createServerFn({ method: "GET" })
  .validator((collegeSlug: string) => collegeSlug)
  .handler(async (ctx) => {
    const supabase = serverClient();
    const { data: college } = await supabase
      .from("colleges")
      .select("id")
      .eq("slug", ctx.data)
      .maybeSingle();
    if (!college) return [];

    const { data, error } = await supabase
      .from("homepage_items")
      .select(
        "id, item_type, eyebrow, title, title_accent, subtitle, body, image_url, icon_name, link_href, link_label, secondary_link_href, secondary_link_label, sort_order, metadata",
      )
      .eq("scope_type", "college")
      .eq("college_id" as any, college.id)
      .eq("is_active", true)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getLatestEvents = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = serverClient();
    const { data, error } = await supabase
      .from("events")
      .select("id, slug, title, tag, start_date, description, featured_image_url, registration_link, sort_order")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .limit(8);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
);
