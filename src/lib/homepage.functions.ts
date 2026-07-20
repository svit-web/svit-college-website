import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function serverClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://agezrfclusigfqysbxwb.supabase.co";
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_dzPKQP8XlBNLebRdVMc-Mg_umCIBmyW";
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
    try {
      const supabase = serverClient();
      const { data, error } = await supabase
        .from("homepage_items")
        .select(
          "id, item_type, eyebrow, title, title_accent, subtitle, body, image_url, icon_name, link_href, link_label, secondary_link_href, secondary_link_label, sort_order, metadata",
        )
        .eq("scope_type", "global")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) {
        console.warn("[Supabase Homepage Items Error]:", error.message);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.warn("[Supabase Homepage Items Catch]:", err);
      return [];
    }
  },
);

export const getCollegesGrid = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const supabase = serverClient();
      const { data, error } = await supabase
        .from("colleges")
        .select("slug, code, name, logo_url, sort_order, metadata")
        .order("sort_order", { ascending: true });
      if (error) {
        console.warn("[Supabase Colleges Grid Error]:", error.message);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.warn("[Supabase Colleges Grid Catch]:", err);
      return [];
    }
  },
);

export const getRecruiterLogos = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const supabase = serverClient();
      const { data, error } = await supabase
        .from("recruiters")
        .select("company_name, logo_url, sort_order")
        .order("sort_order", { ascending: true });
      if (error) {
        console.warn("[Supabase Recruiter Logos Error]:", error.message);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.warn("[Supabase Recruiter Logos Catch]:", err);
      return [];
    }
  },
);

export const getLatestEvents = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const supabase = serverClient();
      const { data, error } = await supabase
        .from("events")
        .select("title, tag, start_date, description, registration_link, sort_order")
        .order("sort_order", { ascending: true })
        .limit(4);
      if (error) {
        console.warn("[Supabase Latest Events Error]:", error.message);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.warn("[Supabase Latest Events Catch]:", err);
      return [];
    }
  },
);
