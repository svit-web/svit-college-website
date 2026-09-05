"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FONT_SCALE_CSS_VAR,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  DEFAULT_FONT_SCALE_PERCENT,
  clampFontScalePercent,
  fontScalePercentToValue,
  fontScaleStorageKey,
  isValidFontScalePercent,
  type FontScaleScope,
} from "@/lib/font-scale";

function applyFontScale(percent: number) {
  document.documentElement.style.setProperty(
    FONT_SCALE_CSS_VAR,
    String(fontScalePercentToValue(percent)),
  );
}

export function useFontScale(scope: FontScaleScope) {
  const storageKey = fontScaleStorageKey(scope);
  const [percent, setPercent] = useState(DEFAULT_FONT_SCALE_PERCENT);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored !== null ? parseInt(stored, 10) : NaN;
    const initial = isValidFontScalePercent(parsed) ? parsed : DEFAULT_FONT_SCALE_PERCENT;
    setPercent(initial);
    applyFontScale(initial);
    if (stored !== null && initial !== parsed) {
      window.localStorage.setItem(storageKey, String(initial));
    }
  }, [storageKey]);

  const setLevel = useCallback(
    (next: number) => {
      const clamped = clampFontScalePercent(next);
      setPercent(clamped);
      applyFontScale(clamped);
      window.localStorage.setItem(storageKey, String(clamped));
    },
    [storageKey],
  );

  const increase = useCallback(() => setLevel(percent + FONT_SCALE_STEP), [percent, setLevel]);
  const decrease = useCallback(() => setLevel(percent - FONT_SCALE_STEP), [percent, setLevel]);
  const reset = useCallback(() => setLevel(DEFAULT_FONT_SCALE_PERCENT), [setLevel]);

  return {
    percent,
    canIncrease: percent < FONT_SCALE_MAX,
    canDecrease: percent > FONT_SCALE_MIN,
    increase,
    decrease,
    reset,
    setLevel,
  };
}
