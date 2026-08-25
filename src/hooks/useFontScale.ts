"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FONT_SCALE_LEVELS,
  FONT_SCALE_CSS_VAR,
  DEFAULT_FONT_SCALE_INDEX,
  clampFontScaleIndex,
  fontScaleIndexToValue,
  fontScaleStorageKey,
  type FontScaleScope,
} from "@/lib/font-scale";

function applyFontScale(index: number) {
  document.documentElement.style.setProperty(
    FONT_SCALE_CSS_VAR,
    String(fontScaleIndexToValue(index)),
  );
}

export function useFontScale(scope: FontScaleScope) {
  const storageKey = fontScaleStorageKey(scope);
  const [index, setIndex] = useState(DEFAULT_FONT_SCALE_INDEX);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored !== null ? parseInt(stored, 10) : DEFAULT_FONT_SCALE_INDEX;
    const initial = Number.isNaN(parsed) ? DEFAULT_FONT_SCALE_INDEX : clampFontScaleIndex(parsed);
    setIndex(initial);
    applyFontScale(initial);
  }, [storageKey]);

  const setLevel = useCallback(
    (next: number) => {
      const clamped = clampFontScaleIndex(next);
      setIndex(clamped);
      applyFontScale(clamped);
      window.localStorage.setItem(storageKey, String(clamped));
    },
    [storageKey],
  );

  const increase = useCallback(() => setLevel(index + 1), [index, setLevel]);
  const decrease = useCallback(() => setLevel(index - 1), [index, setLevel]);
  const reset = useCallback(() => setLevel(DEFAULT_FONT_SCALE_INDEX), [setLevel]);

  return {
    index,
    percent: FONT_SCALE_LEVELS[index],
    canIncrease: index < FONT_SCALE_LEVELS.length - 1,
    canDecrease: index > 0,
    increase,
    decrease,
    reset,
    setLevel,
  };
}
