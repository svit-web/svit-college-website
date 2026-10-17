// Short blurb for club cards: the subtitle if set, else the description (callers clamp it).
export function clubBlurb(c: { subtitle?: string | null; description?: string | null }) {
  const subtitle = c.subtitle?.trim();
  if (subtitle) return { text: subtitle, isFallback: false };
  const description = c.description?.trim();
  return { text: description || "", isFallback: !!description };
}
