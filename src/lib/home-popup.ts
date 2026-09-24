// Types, defaults and pure helpers for the homepage popup banner (app_settings
// key `home_popup`). Shared by the public read (home-popup.functions.ts), the
// admin write (home-popup-next.ts), the public HomePopup component and the
// admin editor's live preview.

export const HOME_POPUP_KEY = 'home_popup';

export type HomePopupMode = 'text' | 'poster';
export type HomePopupShape = 'portrait' | 'square' | 'landscape' | 'original';
export type HomePopupFocus = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface HomePopupLink {
  label: string;
  href: string;
}

export interface HomePopup {
  enabled: boolean;
  /** ISO timestamps; null = no bound. Checked in the browser too, since the homepage is cached. */
  starts_at: string | null;
  ends_at: string | null;
  mode: HomePopupMode;
  // Text mode
  eyebrow: string;
  title: string;
  /** Optional words appended to the title in italic serif, like the homepage hero. */
  title_accent: string;
  body: string;
  primary: HomePopupLink;
  secondary: HomePopupLink;
  // Image: the poster in poster mode, the optional side/top image in text mode
  image_url: string | null;
  image_alt: string;
  image_shape: HomePopupShape;
  image_focus: HomePopupFocus;
  /** Poster mode: where clicking the poster goes (optional). */
  poster_href: string;
  /** Text on the minimized bottom-right pill. */
  minimized_label: string;
}

// Kept short so the popup fits a phone screen without scrolling.
export const HOME_POPUP_BODY_MAX = 160;

export const HOME_POPUP_SHAPES: { value: HomePopupShape; label: string; hint: string }[] = [
  { value: 'portrait', label: 'Portrait 4:5', hint: '1080 × 1350' },
  { value: 'square', label: 'Square 1:1', hint: '1080 × 1080' },
  { value: 'landscape', label: 'Landscape 16:9', hint: '1600 × 900' },
  { value: 'original', label: 'Original', hint: 'no cropping' },
];

export const HOME_POPUP_FOCUS: { value: HomePopupFocus; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'bottom', label: 'Bottom' },
];

/** Starting content for a popup that has never been saved. */
export function defaultHomePopup(admissionYear: string): HomePopup {
  return {
    enabled: false,
    starts_at: null,
    ends_at: null,
    mode: 'text',
    eyebrow: `Admissions Open ${admissionYear}`,
    title: 'Begin your',
    title_accent: 'engineering journey',
    body: 'AICTE-approved programmes on a 15-acre campus in Vasad, Gujarat. Talk to our admissions team today.',
    primary: { label: 'Enquire Now', href: '/admissions/inquiry' },
    secondary: { label: 'Download Brochure', href: '/downloads' },
    image_url: null,
    image_alt: '',
    image_shape: 'portrait',
    image_focus: 'center',
    poster_href: '/admissions/inquiry',
    minimized_label: `Admissions ${admissionYear}`,
  };
}

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;
const link = (v: unknown, fallback: HomePopupLink): HomePopupLink => {
  const o = (v ?? {}) as Partial<HomePopupLink>;
  return { label: str(o.label, fallback.label), href: str(o.href, fallback.href) };
};

/** Tolerant parse of the stored JSON; missing fields fall back to the defaults. */
export function parseHomePopup(value: unknown, admissionYear: string): HomePopup {
  const d = defaultHomePopup(admissionYear);
  if (!value || typeof value !== 'object') return d;
  const v = value as Partial<Record<keyof HomePopup, unknown>>;
  return {
    enabled: v.enabled === true,
    starts_at: typeof v.starts_at === 'string' && v.starts_at ? v.starts_at : null,
    ends_at: typeof v.ends_at === 'string' && v.ends_at ? v.ends_at : null,
    mode: oneOf(v.mode, ['text', 'poster'] as const, d.mode),
    eyebrow: str(v.eyebrow, d.eyebrow),
    title: str(v.title, d.title),
    // Missing on popups saved before the field existed: no accent, not the default one.
    title_accent: str(v.title_accent),
    body: str(v.body, d.body),
    primary: link(v.primary, d.primary),
    secondary: link(v.secondary, d.secondary),
    image_url: typeof v.image_url === 'string' && v.image_url ? v.image_url : null,
    image_alt: str(v.image_alt),
    image_shape: oneOf(v.image_shape, ['portrait', 'square', 'landscape', 'original'] as const, d.image_shape),
    image_focus: oneOf(v.image_focus, ['center', 'top', 'bottom', 'left', 'right'] as const, d.image_focus),
    poster_href: str(v.poster_href, d.poster_href),
    minimized_label: str(v.minimized_label, d.minimized_label),
  };
}

const TOO_LONG = `Keep the text under ${HOME_POPUP_BODY_MAX} characters.`;

/** Problems that stop the popup from being switched on. Empty = OK to publish. */
export function homePopupProblems(p: HomePopup): string[] {
  const problems: string[] = [];
  if (p.mode === 'text') {
    if (!p.title.trim()) problems.push('Add a title.');
    if (p.body.length > HOME_POPUP_BODY_MAX) problems.push(TOO_LONG);
    if (p.image_url && !p.image_alt.trim()) problems.push('Add alt text for the image.');
  } else {
    if (!p.image_url) problems.push('Upload a poster image.');
    if (!p.image_alt.trim()) problems.push('Add alt text describing the poster.');
  }
  for (const [name, l] of [['Main button', p.primary], ['Second button', p.secondary]] as const) {
    if (Boolean(l.label.trim()) !== Boolean(l.href.trim())) problems.push(`${name} needs both text and a link (or neither).`);
  }
  if (p.mode === 'text' && !(p.primary.label.trim() && p.primary.href.trim())) problems.push('Add a main button.');
  if (!p.minimized_label.trim()) problems.push('Add a label for the minimized button.');
  if (p.starts_at && p.ends_at && new Date(p.ends_at) <= new Date(p.starts_at)) {
    problems.push('The end date must be after the start date.');
  }
  return problems;
}

/** Whether the popup should show right now (enabled, inside its date window, and complete). */
export function isHomePopupLive(p: HomePopup, now: Date = new Date()): boolean {
  // Over-long text only blocks saving; on the site it is clamped to fit, so a
  // popup saved under an older, higher limit keeps showing.
  if (!p.enabled || homePopupProblems(p).some((x) => x !== TOO_LONG)) return false;
  if (p.starts_at && now < new Date(p.starts_at)) return false;
  if (p.ends_at && now >= new Date(p.ends_at)) return false;
  return true;
}

export const isExternalHref = (href: string) => /^https?:\/\//i.test(href.trim());

export const SHAPE_ASPECT: Record<Exclude<HomePopupShape, 'original'>, string> = {
  portrait: '4 / 5',
  square: '1 / 1',
  landscape: '16 / 9',
};

export const FOCUS_POSITION: Record<HomePopupFocus, string> = {
  center: 'center',
  top: 'center top',
  bottom: 'center bottom',
  left: 'left center',
  right: 'right center',
};
