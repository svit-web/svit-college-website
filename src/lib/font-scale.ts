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
 * Inline script (embedded in the root layout's <head>) that applies the
 * stored font scale before first paint, so navigating in/out of /admin
 * doesn't flash the wrong scope's size.
 */
export function getFontScaleInitScript(): string {
  return `(function(){try{var scope=window.location.pathname.indexOf('/admin')===0?'admin':'site';var key='svit-font-scale-'+scope;var min=${FONT_SCALE_MIN};var max=${FONT_SCALE_MAX};var stored=window.localStorage.getItem(key);var percent=stored!==null?parseInt(stored,10):${DEFAULT_FONT_SCALE_PERCENT};if(isNaN(percent)){percent=${DEFAULT_FONT_SCALE_PERCENT};}percent=Math.min(Math.max(percent,min),max);document.documentElement.style.setProperty('${FONT_SCALE_CSS_VAR}',String(percent/100));}catch(e){}})();`;
}
