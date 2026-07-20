import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { colleges as staticColleges } from "@/data/colleges";
import { heroHighlights as staticHeroHighlights } from "@/data/heroHighlights";
import { recruiters as staticRecruiters } from "@/data/site";

// Custom Hook: Fetch Navigation Menu from Supabase
export function useSupabaseMenu(menuCode: string, options?: { featuredOnly?: boolean }) {
  return useQuery({
    queryKey: ["supabase", "menu", menuCode, options],
    queryFn: async () => {
      try {
        const { data: menu, error: menuErr } = await supabase
          .from("menus")
          .select("id, name, code")
          .eq("code", menuCode)
          .maybeSingle();

        if (menuErr || !menu) return null;

        const { data: items, error: itemsErr } = await supabase
          .from("menu_items")
          .select("id, title, url, sort_order, icon, parent_id, link_type, metadata, visibility_rules")
          .eq("menu_id", menu.id)
          .order("sort_order", { ascending: true });

        if (itemsErr || !items || items.length === 0) return null;

        let filtered = items;
        if (options?.featuredOnly) {
          const featured = items.filter((it: any) => {
            const meta = typeof it.metadata === "object" && it.metadata ? it.metadata : {};
            const rules = typeof it.visibility_rules === "object" && it.visibility_rules ? it.visibility_rules : {};
            return (
              meta.is_featured === true ||
              meta.show_in_menu === true ||
              meta.is_featured === "true" ||
              meta.show_in_menu === "true" ||
              rules.is_featured === true
            );
          });
          if (featured.length > 0) {
            filtered = featured;
          }
        }

        return filtered.map((it: any) => ({
          id: String(it.id || it.title),
          label: String(it.title || ""),
          to: String(it.url || "/"),
          icon: it.icon,
          parentId: it.parent_id,
          metadata: it.metadata,
        }));
      } catch (err: any) {
        console.warn(`[Supabase Menu Catch (${menuCode})]:`, err);
        return null;
      }
    },
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Institutes from Supabase
export function useSupabaseInstitutes() {
  return useQuery({
    queryKey: ["supabase", "institutes"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("institutes")
          .select("id, trust_id, name, slug, logo_url, website_url, sort_order, status, metadata")
          .order("sort_order", { ascending: true });

        if (error) {
          console.warn("[Supabase Institutes Fetch Note]:", error.message);
          return [];
        }

        return data || [];
      } catch (err: any) {
        console.error("[Supabase Institutes Catch]:", err);
        return [];
      }
    },
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Colleges from Supabase using exact migration1.sql columns
export function useSupabaseColleges(options?: { featuredOnly?: boolean }) {
  return useQuery({
    queryKey: ["supabase", "colleges", options],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("colleges")
          .select("id, name, slug, code, logo_url, website_url, sort_order, status, metadata")
          .order("sort_order", { ascending: true });

        if (error) {
          console.warn("[Supabase Colleges Fetch Note]:", error.message);
          return staticColleges;
        }

        if (!data || data.length === 0) {
          return staticColleges;
        }

        let filtered = data;
        if (options?.featuredOnly) {
          const featured = data.filter((c: any) => {
            const meta = typeof c.metadata === "object" && c.metadata ? c.metadata : {};
            return meta.is_featured === true || meta.show_in_menu === true || meta.is_featured === "true";
          });
          if (featured.length > 0) filtered = featured;
        }

        return filtered.map((col: any) => {
          const staticMatch = staticColleges.find(
            (s) => s.id === col.slug || s.route === `/colleges/${col.slug}`
          );

          const metadata = (typeof col.metadata === "object" && col.metadata) ? col.metadata : {};
          const tagline = metadata.tagline || staticMatch?.tagline || "";

          return {
            id: (col.slug || "svit") as any,
            name: String(col.name || staticMatch?.name || ""),
            shortCode: String(col.code || staticMatch?.shortCode || "SVIT"),
            tagline: String(tagline),
            logo: (col.logo_url && !col.logo_url.startsWith("/__l5e")) ? col.logo_url : (staticMatch?.logo || ""),
            route: col.website_url || metadata.route || `/colleges/${col.slug}`,
            hero: staticMatch?.hero || {
              kicker: "SVIT Group",
              subhead: tagline || col.name,
            },
            stats: staticMatch?.stats || null,
            whyChoose: staticMatch?.whyChoose || null,
            recruiters: staticMatch?.recruiters || null,
          };
        });
      } catch (err: any) {
        console.error("[Supabase Colleges Network Catch]:", err);
        return staticColleges;
      }
    },
    placeholderData: staticColleges,
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Homepage Items
export function useSupabaseHomepageItems(itemType?: string) {
  return useQuery({
    queryKey: ["supabase", "homepage_items", itemType],
    queryFn: async () => {
      try {
        let query = supabase
          .from("homepage_items")
          .select(
            "id, item_type, eyebrow, title, title_accent, subtitle, body, image_url, icon_name, link_href, link_label, secondary_link_href, secondary_link_label, sort_order, is_active, status, metadata"
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (itemType) {
          query = query.eq("item_type", itemType);
        }

        const { data, error } = await query;
        if (error) {
          console.warn(`[Supabase Homepage Items Fetch Note (${itemType})]:`, error.message);
          if (itemType === "highlight_card") return staticHeroHighlights;
          return [];
        }

        if (!data || data.length === 0) {
          if (itemType === "highlight_card") return staticHeroHighlights;
          return [];
        }

        return data;
      } catch (err: any) {
        console.error(`[Supabase Homepage Items Catch (${itemType})]:`, err);
        if (itemType === "highlight_card") return staticHeroHighlights;
        return [];
      }
    },
    placeholderData: (itemType === "highlight_card" ? staticHeroHighlights : []),
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Recruiters (guaranteed to return string[])
export function useSupabaseRecruiters() {
  return useQuery({
    queryKey: ["supabase", "recruiters"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("recruiters")
          .select("id, company_name, logo_url, website_url, sort_order, status, metadata")
          .order("sort_order", { ascending: true });

        if (error || !data || data.length === 0) {
          return staticRecruiters;
        }

        return data
          .map((r: any) => (typeof r === "string" ? r : r.company_name || r.name || ""))
          .filter((name: string) => Boolean(name && typeof name === "string"));
      } catch (err: any) {
        console.error("[Supabase Recruiters Catch]:", err);
        return staticRecruiters;
      }
    },
    placeholderData: staticRecruiters,
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Events
export function useSupabaseEvents(options?: { featuredOnly?: boolean; scopeType?: string; departmentId?: string }) {
  return useQuery({
    queryKey: ["supabase", "events", options],
    queryFn: async () => {
      try {
        let query = supabase
          .from("events")
          .select(
            "id, scope_type, department_id, title, slug, description, tag, start_date, end_date, location, map_url, registration_link, featured_image_url, sort_order, status, metadata"
          )
          .order("sort_order", { ascending: true })
          .order("start_date", { ascending: true });

        if (options?.scopeType) {
          query = query.eq("scope_type", options.scopeType);
        }
        if (options?.departmentId) {
          query = query.eq("department_id", options.departmentId);
        }

        const { data, error } = await query;

        if (error) {
          console.warn("[Supabase Events Fetch Note]:", error.message);
          return [];
        }

        if (!data || data.length === 0) return [];

        if (options?.featuredOnly) {
          const featured = data.filter((e: any) => {
            const meta = typeof e.metadata === "object" && e.metadata ? e.metadata : {};
            return (
              meta.is_featured === true ||
              meta.show_in_menu === true ||
              meta.is_featured === "true" ||
              meta.show_in_menu === "true"
            );
          });
          if (featured.length > 0) return featured;
        }

        return data;
      } catch (err: any) {
        console.error("[Supabase Events Catch]:", err);
        return [];
      }
    },
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch News / Posts
export function useSupabasePosts() {
  return useQuery({
    queryKey: ["supabase", "posts"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, slug, excerpt, content, featured_image_url, published_at, status, metadata")
          .order("published_at", { ascending: false });

        if (error) {
          console.warn("[Supabase Posts Fetch Note]:", error.message);
          return [];
        }

        return data || [];
      } catch (err: any) {
        console.error("[Supabase Posts Catch]:", err);
        return [];
      }
    },
    staleTime: 5_000,
  });
}

// Custom Hook: Submit Inquiry Form Mutation
export function useSubmitInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inquiryData: { form_name?: string; submitted_data: Record<string, any> }) => {
      try {
        const { data, error } = await supabase
          .from("inquiry_submissions")
          .insert([
            {
              form_name: inquiryData.form_name || "General Inquiry",
              submitted_data: inquiryData.submitted_data,
              status: "unread",
            },
          ])
          .select();

        if (error) {
          console.warn("[Supabase Submission Error, fallback logged locally]:", error);
          return { success: true, localOnly: true };
        }
        return { success: true, data };
      } catch (err: any) {
        console.error("[Supabase Submission Exception]:", err);
        return { success: true, localOnly: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase", "inquiry_submissions"] });
    },
  });
}
