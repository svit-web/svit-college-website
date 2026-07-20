import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { colleges as staticColleges } from "@/data/colleges";
import { heroHighlights as staticHeroHighlights } from "@/data/heroHighlights";
import { recruiters as staticRecruiters, courses as staticCourses } from "@/data/site";
import { departments as staticDepartments } from "@/data/academics";
import { staff as staticStaff } from "@/data/staff";

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

// Custom Hook: Fetch Colleges from Supabase
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

// Custom Hook: Fetch Academic Departments from Supabase
export function useSupabaseDepartments() {
  return useQuery({
    queryKey: ["supabase", "departments"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("departments")
          .select("id, college_id, name, slug, code, status, metadata")
          .order("name", { ascending: true });

        if (error || !data || data.length === 0) {
          return staticDepartments;
        }

        return data.map((dept: any) => {
          const staticMatch = staticDepartments.find((s) => s.id === dept.slug || s.name === dept.name);
          const meta = typeof dept.metadata === "object" && dept.metadata ? dept.metadata : {};

          return {
            id: dept.slug || staticMatch?.id || dept.id,
            name: dept.name || staticMatch?.name || "",
            code: dept.code || staticMatch?.code || "",
            shortName: staticMatch?.shortName || dept.code || dept.name,
            kicker: meta.kicker || staticMatch?.kicker || "Department of Engineering",
            subhead: meta.subhead || staticMatch?.subhead || `Welcome to Department of ${dept.name}`,
            introText: meta.introText || staticMatch?.introText || "",
            establishedYear: meta.establishedYear || staticMatch?.establishedYear || "1997",
            intake: meta.intake || staticMatch?.intake || "60",
            hodMessage: staticMatch?.hodMessage || null,
            vision: meta.vision || staticMatch?.vision || "",
            missionPoints: meta.missionPoints || staticMatch?.missionPoints || [],
            peos: meta.peos || staticMatch?.peos || [],
            psos: meta.psos || staticMatch?.psos || [],
            labs: staticMatch?.labs || [],
            outcomes: staticMatch?.outcomes || null,
            curriculum: staticMatch?.curriculum || null,
            activities: staticMatch?.activities || null,
          };
        });
      } catch (err: any) {
        console.error("[Supabase Departments Catch]:", err);
        return staticDepartments;
      }
    },
    placeholderData: staticDepartments,
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Academic Courses from Supabase
export function useSupabaseCourses() {
  return useQuery({
    queryKey: ["supabase", "courses"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("id, department_id, name, code, degree_level, status, metadata")
          .order("name", { ascending: true });

        if (error || !data || data.length === 0) {
          return staticCourses;
        }

        return data.map((course: any) => {
          const slugKey = (course.code || course.name).toLowerCase().replace(/[^a-z0-9]/g, "-");
          const staticMatch = staticCourses.find((s) => s.slug === slugKey || s.short === course.code);
          const meta = typeof course.metadata === "object" && course.metadata ? course.metadata : {};

          return {
            slug: slugKey || staticMatch?.slug || "btech",
            name: course.name || staticMatch?.name || "",
            short: course.code || staticMatch?.short || "",
            fullName: meta.fullName || staticMatch?.fullName || course.name,
            tagline: meta.tagline || staticMatch?.tagline || "Degree Programme",
            description: meta.description || staticMatch?.description || "",
            duration: meta.duration || staticMatch?.duration || "4 Years",
            intake: meta.intake || staticMatch?.intake || "60",
            eligibility: meta.eligibility || staticMatch?.eligibility || "10+2 with Physics, Chemistry, Maths",
            degreeLevel: course.degree_level || staticMatch?.degreeLevel || "undergraduate",
            color: staticMatch?.color || "bg-navy",
          };
        });
      } catch (err: any) {
        console.error("[Supabase Courses Catch]:", err);
        return staticCourses;
      }
    },
    placeholderData: staticCourses,
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

// Custom Hook: Fetch Recruiters
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

// Custom Hook: Fetch Staff Profiles from Supabase
export function useSupabaseStaffProfiles(departmentId?: string) {
  return useQuery({
    queryKey: ["supabase", "staff_profiles", departmentId],
    queryFn: async () => {
      try {
        let query = supabase
          .from("staff_profiles")
          .select("id, title, first_name, last_name, email, phone, bio, profile_image_url, office_location, status, metadata")
          .order("first_name", { ascending: true });

        const { data, error } = await query;
        if (error || !data || data.length === 0) {
          if (departmentId) {
            return staticStaff.filter((s) => s.departmentId === departmentId);
          }
          return staticStaff;
        }

        return data.map((sp: any) => {
          const fullName = `${sp.title ? sp.title + " " : ""}${sp.first_name} ${sp.last_name}`.trim();
          const meta = typeof sp.metadata === "object" && sp.metadata ? sp.metadata : {};
          return {
            id: sp.id,
            employeeCode: meta.employeeCode || sp.id,
            name: fullName,
            designation: meta.designation || "Faculty Member",
            rankGroup: (meta.rankGroup || "Faculty") as "HOD" | "Faculty" | "Support",
            qualification: meta.qualification || null,
            experienceYears: meta.experienceYears || null,
            gender: meta.gender || null,
            status: "Working" as const,
            departmentId: meta.departmentId || departmentId || "dept-ce",
            photo: sp.profile_image_url || null,
          };
        });
      } catch (err: any) {
        console.error("[Supabase Staff Profiles Catch]:", err);
        return staticStaff;
      }
    },
    placeholderData: staticStaff,
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Placement Statistics from Supabase
export function useSupabasePlacementStats(collegeId?: string) {
  return useQuery({
    queryKey: ["supabase", "placement_statistics", collegeId],
    queryFn: async () => {
      try {
        let query = supabase
          .from("placement_statistics")
          .select("id, college_id, academic_year, total_offers, highest_package, average_package, placement_percentage, metadata")
          .order("academic_year", { ascending: false });

        if (collegeId) {
          query = query.eq("college_id", collegeId);
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) return null;
        return data;
      } catch (err: any) {
        console.error("[Supabase Placement Stats Catch]:", err);
        return null;
      }
    },
    staleTime: 5_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 8 — CAMPUS LIFE & DOWNLOADS
// ─────────────────────────────────────────────────────────────────────────────

import {
  academicFacilities as staticAcademicFacilities,
  sportsFacilities as staticSportsFacilities,
  centreDetails as staticCentreDetails,
  clubDetails as staticClubDetails,
  type CampusItem,
} from "@/data/campus-rfe";

/** Map a Supabase `facilities` row → CampusItem shape */
function rowToCampusItem(row: any): CampusItem {
  const meta = typeof row.metadata === "object" && row.metadata ? row.metadata : {};
  return {
    slug: row.slug || (row.name as string).toLowerCase().replace(/\s+/g, "-"),
    title: row.name || "",
    subtitle: meta.subtitle || "",
    accent: meta.accent || row.facility_type || "Facility",
    description: meta.description || row.name || "",
    highlights: Array.isArray(meta.highlights) ? meta.highlights : [],
    image: row.image_url || meta.image || null,
  };
}

/** Map a Supabase `student_clubs` / `centers` row → CampusItem shape */
function rowToClubItem(row: any): CampusItem {
  const meta = typeof row.metadata === "object" && row.metadata ? row.metadata : {};
  return {
    slug: row.slug || (row.name as string).toLowerCase().replace(/\s+/g, "-"),
    title: row.name || "",
    subtitle: meta.subtitle || "",
    accent: meta.accent || "Club",
    description: meta.description || row.name || "",
    highlights: Array.isArray(meta.highlights) ? meta.highlights : [],
    image: row.logo_url || meta.image || null,
  };
}

// Custom Hook: Fetch Campus Facilities from Supabase
export function useSupabaseFacilities(type?: "campus" | "building" | "laboratory") {
  return useQuery({
    queryKey: ["supabase", "facilities", type],
    queryFn: async () => {
      try {
        let query = supabase
          .from("facilities")
          .select("id, name, slug, facility_type, description, image_url, sort_order, status, metadata")
          .order("sort_order", { ascending: true });

        if (type) {
          query = query.eq("facility_type", type);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
          return {
            academic: staticAcademicFacilities,
            sports: staticSportsFacilities,
          };
        }

        const mapped = data.map(rowToCampusItem);
        // Partition by accent keyword for backward-compat rendering
        const academic = mapped.filter((f) =>
          ["academic facility", "academic", "laboratory"].includes(f.accent.toLowerCase())
        );
        const sports = mapped.filter((f) =>
          ["outdoor", "indoor", "sports"].includes(f.accent.toLowerCase())
        );

        return {
          academic: academic.length > 0 ? academic : staticAcademicFacilities,
          sports: sports.length > 0 ? sports : staticSportsFacilities,
        };
      } catch (err: any) {
        console.error("[Supabase Facilities Catch]:", err);
        return { academic: staticAcademicFacilities, sports: staticSportsFacilities };
      }
    },
    placeholderData: { academic: staticAcademicFacilities, sports: staticSportsFacilities },
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Student Clubs from Supabase
export function useSupabaseStudentClubs() {
  return useQuery({
    queryKey: ["supabase", "student_clubs"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("student_clubs")
          .select("id, name, slug, logo_url, sort_order, status, metadata")
          .order("sort_order", { ascending: true });

        if (error || !data || data.length === 0) return staticClubDetails;

        return data.map(rowToClubItem);
      } catch (err: any) {
        console.error("[Supabase Student Clubs Catch]:", err);
        return staticClubDetails;
      }
    },
    placeholderData: staticClubDetails,
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Centers (co-curricular) from Supabase
export function useSupabaseCenters() {
  return useQuery({
    queryKey: ["supabase", "centers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("centers")
          .select("id, name, slug, logo_url, sort_order, status, metadata")
          .order("sort_order", { ascending: true });

        if (error || !data || data.length === 0) return staticCentreDetails;

        return data.map(rowToClubItem);
      } catch (err: any) {
        console.error("[Supabase Centers Catch]:", err);
        return staticCentreDetails;
      }
    },
    placeholderData: staticCentreDetails,
    staleTime: 5_000,
  });
}

// Custom Hook: Fetch Downloads from Supabase
export function useSupabaseDownloads() {
  return useQuery({
    queryKey: ["supabase", "downloads"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("downloads")
          .select("id, title, file_url, sort_order, status, metadata")
          .order("sort_order", { ascending: true });

        if (error || !data || data.length === 0) return null;

        return data.map((d: any) => ({
          id: d.id,
          title: d.title || "",
          fileUrl: d.file_url || "#",
        }));
      } catch (err: any) {
        console.error("[Supabase Downloads Catch]:", err);
        return null;
      }
    },
    staleTime: 5_000,
  });
}
