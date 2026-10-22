// @vitest-environment node

/**
 * The docs site's dark chip values hold the AA floor.
 *
 * `@canonical/prism-core`'s Chip draws an instance's text in its namespace
 * tint and its fill in that same tint at the fill weight, composited over the
 * page; the package guards its light fallbacks, and the dark values are this
 * site's, defined in `styles/app.css`. Every namespace shares one lightness
 * and one chroma and differs only in hue, so the property is that EVERY hue
 * clears 4.5:1 at the dark hooks.
 *
 * oklch → sRGB uses Björn Ottosson's published OKLab ↔ linear-sRGB matrices;
 * compositing happens in gamma-encoded sRGB, where the browser composites;
 * luminance and ratio follow WCAG 2.x.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

type Srgb = readonly [number, number, number];

/** `--color-background` in the dark theme: `--color-palette-gray-930`. */
const DARK_BACKGROUND_OKLCH = [0.2308, 0, 0] as const;

const APP_CSS = readFileSync(
  fileURLToPath(new URL("../../styles/app.css", import.meta.url)),
  "utf8",
);

/**
 * Read the value a dark hook declares. It appears in both dark blocks
 * (`:root.dark` and the `prefers-color-scheme` fallback), and every
 * occurrence must agree or the two dark paths have drifted apart.
 */
function readDarkHook(property: string): string {
  const values = [
    ...APP_CSS.matchAll(new RegExp(`${property}:\\s*([^;]+);`, "g")),
  ].map((match) => (match.at(1) ?? "").trim());
  expect(values, `${property} in both dark blocks`).toHaveLength(2);
  expect(new Set(values).size, `${property} agrees across blocks`).toBe(1);
  const value = values.at(0);
  if (value === undefined) {
    throw new Error(`${property} is not declared in styles/app.css`);
  }
  return value;
}

/** Convert an oklch colour to gamma-encoded sRGB, clamped to the gamut. */
function convertOklchToSrgb([lightness, chroma, hueDegrees]: readonly [
  number,
  number,
  number,
]): Srgb {
  const hueRadians = (hueDegrees * Math.PI) / 180;
  const a = chroma * Math.cos(hueRadians);
  const b = chroma * Math.sin(hueRadians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const applyGamma = (linear: number): number => {
    const clamped = Math.min(1, Math.max(0, linear));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * clamped ** (1 / 2.4) - 0.055;
  };
  return [
    applyGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    applyGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    applyGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/** Compute the WCAG 2.x relative luminance of an sRGB colour. */
function computeRelativeLuminance([red, green, blue]: Srgb): number {
  const linearizeChannel = (channel: number): number =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return (
    0.2126 * linearizeChannel(red) +
    0.7152 * linearizeChannel(green) +
    0.0722 * linearizeChannel(blue)
  );
}

/** Measure the WCAG 2.x contrast ratio of two sRGB colours. */
function measureContrast(first: Srgb, second: Srgb): number {
  const firstLuminance = computeRelativeLuminance(first);
  const secondLuminance = computeRelativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("the dark chip hooks", () => {
  it("keep instance text-vs-composited-fill at ≥ 4.5:1 for every hue", () => {
    const lightness = Number(readDarkHook("--chip-tint-l"));
    const chroma = Number(readDarkHook("--chip-tint-c"));
    const alpha =
      Number(readDarkHook("--chip-fill-weight-instance").replace("%", "")) /
      100;
    const background = convertOklchToSrgb(DARK_BACKGROUND_OKLCH);

    for (let hue = 0; hue < 360; hue += 15) {
      const text = convertOklchToSrgb([lightness, chroma, hue]);
      const [textRed, textGreen, textBlue] = text;
      const [backgroundRed, backgroundGreen, backgroundBlue] = background;
      const fill: Srgb = [
        alpha * textRed + (1 - alpha) * backgroundRed,
        alpha * textGreen + (1 - alpha) * backgroundGreen,
        alpha * textBlue + (1 - alpha) * backgroundBlue,
      ];
      expect(
        measureContrast(text, fill),
        `hue ${hue} on its instance fill`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
