import { supabase } from "@/integrations/supabase/client";

const formIdCache = new Map<string, string>();

async function getFormId(slug: string): Promise<string> {
  const cached = formIdCache.get(slug);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("inquiry_forms")
    .select("id, metadata")
    .eq("status", "published")
    .is("deleted_at", null);

  if (error) throw new Error("Could not load form configuration.");

  const form = (data ?? []).find(
    (f: any) => (f.metadata as any)?.slug === slug
  );
  if (!form) throw new Error(`Form "${slug}" not found.`);

  formIdCache.set(slug, form.id);
  return form.id;
}

export async function submitForm(
  formSlug: string,
  submittedData: Record<string, unknown>
): Promise<void> {
  const formId = await getFormId(formSlug);

  const { error } = await supabase
    .from("inquiry_submissions")
    .insert({ form_id: formId, submitted_data: submittedData } as any);

  if (error) throw new Error("Submission failed. Please try again.");
}
