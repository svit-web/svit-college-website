// Shape checks for the `pages` singletons whose metadata is the whole public
// page (about, admissions, alumni). The dedicated page editors and the generic
// tables screen both save through this, so a renamed or typo'd key fails
// loudly instead of silently dropping content from the public page.

export function validateAboutPageMetadata(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "metadata must be a JSON object";
  }
  const record = value as Record<string, unknown>;
  const requiredObjectKeys = [
    "hero",
    "history",
    "vision",
    "mission",
    "leadership",
    "accreditation",
    "facilities",
    "media",
    "contact",
  ];
  for (const key of requiredObjectKeys) {
    if (typeof record[key] !== "object" || record[key] === null || Array.isArray(record[key])) {
      return `metadata.${key} must be an object`;
    }
  }
  if (!Array.isArray(record.quickFacts)) return "metadata.quickFacts must be an array";
  if (!Array.isArray(record.coreValues)) return "metadata.coreValues must be an array";
  const leadership = record.leadership as Record<string, unknown> | undefined;
  for (const person of ["chairman", "principal"]) {
    const entry = leadership?.[person];
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return `metadata.leadership.${person} must be a single object, not an array`;
    }
  }
  return null;
}

export function validateAdmissionsPageMetadata(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "metadata must be a JSON object";
  }
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.steps)) return "metadata.steps must be an array";
  if (!Array.isArray(record.faqs)) return "metadata.faqs must be an array";
  return null;
}
