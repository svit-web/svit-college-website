import type { EntryImageFit } from "./entry";
import { publicSupabase } from "./supabase-public";

type FitTable = "student_clubs" | "posts" | "achievements";

/**
 * The Detail page photo fit for one Entry. Read on its own (not part of the
 * shared list/detail selects) so a missing column or failed query degrades to
 * `fill` — today's look — instead of breaking the page.
 */
export async function getEntryImageFit(table: FitTable, id: string): Promise<EntryImageFit> {
  try {
    // image_fit is not in the generated DB types until they are regenerated.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (publicSupabase() as any)
      .from(table)
      .select("image_fit")
      .eq("id", id)
      .maybeSingle();
    if (error) return "fill";
    return data?.image_fit === "fit" ? "fit" : "fill";
  } catch {
    return "fill";
  }
}
