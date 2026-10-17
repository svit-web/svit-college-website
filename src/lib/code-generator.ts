// Derives an admin-facing code/slug value from a record's name, for fields
// that are auto-filled in the admin CRUD UI (see AdminCrudManager's
// `autoGenerateFrom`) but remain freely editable afterward. Each variant
// matches an actual DB constraint — see the callers for which table/column
// uses which one.

// Lowercase, hyphen-separated (colleges.slug, events.slug, achievements.slug,
// facilities.slug): must satisfy `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Uppercase, hyphens allowed (departments.code, courses.code, facilities.code):
// no DB format constraint, but matches existing data conventions like `ME-CS`.
export function toCode(name: string): string {
  return toSlug(name).toUpperCase();
}

// Uppercase, no hyphens/separators (colleges.code): must satisfy
// `^[A-Z0-9]+$`.
export function toCodeStrict(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, '');
}
