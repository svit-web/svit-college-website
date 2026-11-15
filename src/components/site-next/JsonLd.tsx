// Renders schema.org structured data. `<` is escaped so content pulled from
// Supabase can't close the script tag early.
const SCRIPT_CLOSE_REGEX = /</g;

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(SCRIPT_CLOSE_REGEX, "\\u003c") }}
    />
  );
}
