// Server functions for colleges data from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface College {
  id: string;
  name: string;
  slug: string;
  code: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    shortCode?: string;
    tagline?: string;
    hero?: {
      kicker?: string;
      subhead?: string;
    };
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published colleges ordered by sort_order
 */
export const getAllColleges = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching colleges:', error);
      throw error;
    }

    return data as College[];
  });

/**
 * Fetch departments for a college by college slug
 */
export const getDepartmentsByCollegeSlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;
    // First get the college id
    const { data: college, error: cErr } = await supabase
      .from('colleges')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (cErr || !college) return [] as { id: string; name: string; slug: string; code: string; logo_url: string | null; metadata: any }[];

    const { data, error } = await supabase
      .from('departments')
      .select('id, name, slug, code, logo_url, metadata')
      .eq('college_id', college.id)
      .eq('status', 'published')
      .order('name');
    if (error) return [] as { id: string; name: string; slug: string; code: string; metadata: any }[];

    // Departments and branches are edited in two separate admin screens
    // (/admin/tables/departments vs /admin/tables/branches) but often
    // represent the same real-world thing (e.g. Computer Engineering) — a
    // department without its own logo falls back to its matching branch's
    // icon (linked via metadata.engSlug) so one upload covers both grids.
    const { data: branches } = await supabase
      .from('branches')
      .select('icon_url, metadata')
      .not('icon_url', 'is', null);
    const iconByEngSlug: Record<string, string> = {};
    for (const b of branches ?? []) {
      const engSlug = (b.metadata as any)?.engSlug;
      if (engSlug && b.icon_url) iconByEngSlug[engSlug] = b.icon_url;
    }

    return (data ?? []).map((d: any) => ({
      ...d,
      logo_url: d.logo_url ?? iconByEngSlug[d.metadata?.engSlug] ?? null,
    })) as { id: string; name: string; slug: string; code: string; logo_url: string | null; metadata: any }[];
  });

/**
 * Fetch a single college by slug
 */
export const getCollegeBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async (ctx) => {
    const slug = ctx.data;
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;

    return data as College | null;
  });
