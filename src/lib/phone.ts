// Phone numbers are optional everywhere they're collected (staff profiles),
// admin-only, and never shown on the public site. When one is given, it's
// normalized to a bare 10-digit Indian mobile number before being stored.

export interface NormalizedPhone {
  value: string | null;
  error?: string;
}

/**
 * Strip spaces/dashes/parens and an optional `+91`/`91`/`0` prefix, then
 * require exactly 10 digits. An empty input is valid (phone is optional).
 */
export function normalizePhone(raw: string | null | undefined): NormalizedPhone {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { value: null };

  let digits = trimmed.replace(/[\s-()]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);

  if (!/^\d{10}$/.test(digits)) {
    return {
      value: null,
      error:
        "Phone must be a 10-digit Indian mobile number (optionally prefixed with +91, 91 or 0).",
    };
  }
  return { value: digits };
}
