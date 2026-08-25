export const FONT_SCALE_LEVELS = [100, 115, 130, 145] as const;
export const DEFAULT_FONT_SCALE_INDEX = 0;
export const FONT_SCALE_CSS_VAR = "--font-scale";

export type FontScaleScope = "site" | "admin";

export function fontScaleStorageKey(scope: FontScaleScope): string {
  return `svit-font-scale-${scope}`;
}

export function fontScaleIndexToValue(index: number): number {
  return FONT_SCALE_LEVELS[index] / 100;
}

export function clampFontScaleIndex(index: number): number {
  return Math.min(Math.max(index, 0), FONT_SCALE_LEVELS.length - 1);
}

/**
 * Inline script (embedded in the root layout's <head>) that applies the
 * stored font scale before first paint, so navigating in/out of /admin
 * doesn't flash the wrong scope's size.
 */
export function getFontScaleInitScript(): string {
  return `(function(){try{var scope=window.location.pathname.indexOf('/admin')===0?'admin':'site';var key='svit-font-scale-'+scope;var levels=${JSON.stringify(FONT_SCALE_LEVELS)};var stored=window.localStorage.getItem(key);var index=stored!==null?parseInt(stored,10):0;if(isNaN(index)||index<0||index>=levels.length){index=0;}document.documentElement.style.setProperty('${FONT_SCALE_CSS_VAR}',String(levels[index]/100));}catch(e){}})();`;
}
