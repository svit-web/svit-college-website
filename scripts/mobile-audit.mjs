// Mobile audit for the beige redesign (docs/design/BEIGE_DESIGN_SYSTEM.md §8).
// Loads pages at phone/tablet widths against a running dev server and reports:
//   - horizontal page overflow (document wider than the viewport)
//   - tap targets below the minimum: 44px for controls (buttons, tabs, pills),
//     24px for inline text links
//
// Usage: node scripts/mobile-audit.mjs /path/one /path/two ...
// Env:   BASE_URL (default http://localhost:3000), CHROME_PATH (system Chrome if
//        Playwright's bundled browser isn't installed), WIDTHS (default 360,390,768),
//        WAIT ms after load before measuring (default 1200; raise it to let entrance animations settle)
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const widths = (process.env.WIDTHS ?? "360,390,768").split(",").map(Number);
const wait = Number(process.env.WAIT ?? 1200);
const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error("Usage: node scripts/mobile-audit.mjs /path [/path ...]");
  process.exit(1);
}

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
let failures = 0;

for (const width of widths) {
  for (const path of paths) {
    const page = await browser.newPage({
      viewport: { width, height: 800 },
      hasTouch: true,
      isMobile: width < 768,
    });
    await page.goto(base + path, { waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(wait);
    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const overflow = document.documentElement.scrollWidth - vw;
      // Hit area = the element's box, grown by any ::after overlay used to enlarge it.
      const hit = (el) => {
        const r = el.getBoundingClientRect();
        const after = getComputedStyle(el, "::after");
        if (after.content !== "none" && after.position === "absolute") {
          const top = parseFloat(after.top) || 0;
          const bottom = parseFloat(after.bottom) || 0;
          return { w: r.width, h: r.height - top - bottom };
        }
        return { w: r.width, h: r.height };
      };
      const small = [];
      for (const el of document.querySelectorAll("a, button, [role=tab]")) {
        const style = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || style.visibility === "hidden") continue;
        if (el.closest("[aria-hidden=true]")) continue;
        // Inline text links inside running prose are exempt (WCAG 2.5.8 inline exception).
        const inProse =
          el.tagName === "A" && el.closest("p, li") && !el.className.includes("rounded");
        const isControl = el.tagName === "BUTTON" || el.className.includes("rounded-full");
        const min = isControl ? 44 : 24;
        const { h } = hit(el);
        if (!inProse && Math.round(h) < min) {
          const label = (el.innerText || el.getAttribute("aria-label") || el.tagName)
            .trim()
            .slice(0, 32);
          small.push(`${label} (${Math.round(h)}px < ${min})`);
        }
      }
      return { overflow, small };
    });
    const ok = result.overflow <= 0 && result.small.length === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${width}px ${path}` +
        (result.overflow > 0 ? `\n  overflow: ${result.overflow}px` : "") +
        (result.small.length ? `\n  small targets: ${[...new Set(result.small)].join(", ")}` : ""),
    );
    await page.close();
  }
}

await browser.close();
process.exit(failures ? 1 : 0);
