export const FONT_SCALE_MIN = 80;
export const FONT_SCALE_MAX = 120;
export const FONT_SCALE_STEP = 5;
export const DEFAULT_FONT_SCALE_PERCENT = 100;
export const FONT_SCALE_CSS_VAR = "--font-scale";

export type FontScaleScope = "site" | "admin";

export function fontScaleStorageKey(scope: FontScaleScope): string {
  return `svit-font-scale-${scope}`;
}

export function fontScalePercentToValue(percent: number): number {
  return percent / 100;
}

export function clampFontScalePercent(percent: number): number {
  const clamped = Math.min(Math.max(percent, FONT_SCALE_MIN), FONT_SCALE_MAX);
  return Math.round(clamped / FONT_SCALE_STEP) * FONT_SCALE_STEP;
}

/**
 * A stored value is only trusted if it's a clean step within range. Anything
 * else — non-numeric, out of range, or off-step (including leftover indices
 * 0-3 from the old 4-level scheme) — is garbage and should fall back to the
 * default rather than being clamped into range.
 */
export function isValidFontScalePercent(percent: number): boolean {
  return (
    Number.isInteger(percent) &&
    percent >= FONT_SCALE_MIN &&
    percent <= FONT_SCALE_MAX &&
    percent % FONT_SCALE_STEP === 0
  );
}

/**
 * Inline script (embedded in the root layout's <head>) that applies the
 * stored font scale before first paint, so navigating in/out of /admin
 * doesn't flash the wrong scope's size. Mirrors isValidFontScalePercent's
 * validation and self-heals an invalid stored value back to the default.
 */
export function getFontScaleInitScript(): string {
  return `(function(){try{var scope=window.location.pathname.indexOf('/admin')===0?'admin':'site';var key='svit-font-scale-'+scope;var min=${FONT_SCALE_MIN};var max=${FONT_SCALE_MAX};var step=${FONT_SCALE_STEP};var def=${DEFAULT_FONT_SCALE_PERCENT};var stored=window.localStorage.getItem(key);var percent=stored!==null?parseInt(stored,10):NaN;var valid=!isNaN(percent)&&percent>=min&&percent<=max&&percent%step===0;var value=valid?percent:def;if(stored!==null&&!valid){window.localStorage.setItem(key,String(value));}document.documentElement.style.setProperty('${FONT_SCALE_CSS_VAR}',String(value/100));}catch(e){}})();`;
}
