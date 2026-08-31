// Server functions for accreditations data from Supabase
import { publicSupabase, unwrap } from "@/lib/supabase-public";

export interface Accreditation {
  id: string;
  organization: string;
  value: string;
  received_year: number;
  expiry_date: string | null;
  status: "draft" | "published" | "archived";
  accreditation_body: string | null;
  description: string | null;
  document_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published accreditations
 */
export async function getAllAccreditations() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("accreditations")
    .select("*")
    .eq("status", "published")
    .order("organization", { ascending: true });

  return unwrap<Accreditation[]>(result as any, "accreditations");
}

/**
 * Fetch a single accreditation by organization
 */
export async function getAccreditationByOrg(org: string) {
  const supabase = publicSupabase();
  const result = await supabase
    .from("accreditations")
    .select("*")
    .eq("organization", org)
    .eq("status", "published")
    .single();

  return unwrap<Accreditation>(result as any, "accreditation");
}
