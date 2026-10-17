// Ordering for public staff listings: ascending muster number (0-based, numeric),
// staff without one last, ties broken by name. Callers pin the HOD themselves.
export function compareByMuster(
  a: { name: string; musterNumber?: number | null },
  b: { name: string; musterNumber?: number | null },
): number {
  const am = a.musterNumber ?? null;
  const bm = b.musterNumber ?? null;
  if (am !== null && bm !== null && am !== bm) return am - bm;
  if (am !== null && bm === null) return -1;
  if (am === null && bm !== null) return 1;
  return a.name.localeCompare(b.name);
}
