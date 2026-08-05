import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export interface Sport {
  id: string;
  name: string;
  slug: string;
  category: "outdoor" | "indoor" | "aquatic" | "combat";
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  status: string;
  players_count: number | null;
  coach_name: string | null;
  coach_image_url: string | null;
  achievements_count: number | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SportAchievement {
  id: string;
  sport_id: string | null;
  title: string;
  description: string | null;
  achievement_date: string | null;
  level: "university" | "state" | "national" | "international";
  position: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  status: string;
  metadata: Record<string, string | number | boolean | null>;
  sport?: { name: string; slug: string } | null;
}

export const getSports = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await (supabase as any)
    .from("sports")
    .select("id, name, slug, category, description, cover_image_url, is_active, sort_order, status, metadata, created_at")
    .eq("status", "published")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Sport[];
});

export const getSportsAchievements = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await (supabase as any)
    .from("sports_achievements")
    .select("id, sport_id, title, description, achievement_date, level, position, image_url, is_active, sort_order, status, metadata, sport:sport_id(name, slug)")
    .eq("status", "published")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("achievement_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SportAchievement[];
});
