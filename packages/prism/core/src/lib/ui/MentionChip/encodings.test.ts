import { describe, expect, it } from "vitest";
import { MESSAGES } from "../../i18n/index.js";
import { BOXES, GOLDEN_ANGLE_DEGREES, KINDS, LIFECYCLES } from "./constants.js";
import {
  assertNonEmptyString,
  buildMentionChipChannelStyle,
  deriveNamespaceFromUri,
  getBoxEncoding,
  getKindEncoding,
  getLifecycleEncoding,
  resolveNamespaceTint,
} from "./encodings.js";

describe("chip encodings", () => {
  it("resolves a row for every kind", () => {
    for (const kind of KINDS) {
      const row = getKindEncoding(kind);
      expect(row.value).toBe(kind);
      expect(MESSAGES[row.labelKey]).not.toBe("");
      expect(MESSAGES[row.shapeKey]).not.toBe("");
    }
  });

  it("resolves a row for every box", () => {
    for (const box of BOXES) {
      const row = getBoxEncoding(box);
      expect(row.value).toBe(box);
      expect(MESSAGES[row.labelKey]).not.toBe("");
    }
  });

  it("resolves a row for every lifecycle", () => {
    for (const lifecycle of LIFECYCLES) {
      const row = getLifecycleEncoding(lifecycle);
      expect(row.value).toBe(lifecycle);
      expect(MESSAGES[row.labelKey]).not.toBe("");
    }
  });

  it("throws on values outside the vocabulary", () => {
    // Content (MDX, graph data) is untyped at runtime — lookups fail loudly.
    expect(() => getKindEncoding("gadget" as never)).toThrow(/unknown kind/);
    expect(() => getBoxEncoding("crate" as never)).toThrow(/unknown box/);
    expect(() => getLifecycleEncoding("retired" as never)).toThrow(
      /unknown lifecycle/,
    );
  });

  it("keeps each channel's payloads distinct (the encoding stays injective)", () => {
    const radii = KINDS.map((value) => getKindEncoding(value).radius);
    expect(new Set(radii).size).toBe(radii.length);

    const weights = BOXES.map((value) => {
      const row = getBoxEncoding(value);
      return `${row.fillWeight}/${row.strokeWeight}`;
    });
    expect(new Set(weights).size).toBe(weights.length);

    const dots = LIFECYCLES.map((value) => getLifecycleEncoding(value).dot);
    expect(new Set(dots).size).toBe(dots.length);
  });

  it("shows a dot for every lifecycle except none", () => {
    for (const lifecycle of LIFECYCLES) {
      const { dot } = getLifecycleEncoding(lifecycle);
      if (lifecycle === "none") {
        expect(dot).toBeNull();
      } else {
        expect(dot).not.toBeNull();
      }
    }
  });
});

describe("assertNonEmptyString", () => {
  it("accepts a non-empty string and rejects anything else", () => {
    expect(() => assertNonEmptyString("x", "uri")).not.toThrow();
    expect(() => assertNonEmptyString("", "uri")).toThrow(
      'MentionChip: "uri" must be a non-empty string',
    );
    expect(() => assertNonEmptyString(7, "label")).toThrow(
      'MentionChip: "label" must be a non-empty string',
    );
  });
});

describe("deriveNamespaceFromUri", () => {
  it("returns the text before the first colon", () => {
    expect(deriveNamespaceFromUri("ds:global.component.button")).toBe("ds");
    expect(deriveNamespaceFromUri("mystery:thing")).toBe("mystery");
    expect(deriveNamespaceFromUri("https://example.org/a")).toBe("https");
  });

  it("returns undefined for a URI with no prefix", () => {
    expect(deriveNamespaceFromUri("no-prefix-at-all")).toBeUndefined();
  });

  it("rejects an empty uri", () => {
    expect(() => deriveNamespaceFromUri("")).toThrow(/non-empty/);
  });
});

describe("resolveNamespaceTint", () => {
  const prefixes = ["ds", "cs", "docs"] as const;

  it("steps the hue by the golden angle per place in the prefixes", () => {
    expect(resolveNamespaceTint("ds", prefixes)).toBe(
      "oklch(var(--mention-chip-tint-l, 0.45) var(--mention-chip-tint-c, 0.12) 0)",
    );
    expect(resolveNamespaceTint("cs", prefixes)).toBe(
      `oklch(var(--mention-chip-tint-l, 0.45) var(--mention-chip-tint-c, 0.12) ${Math.round(GOLDEN_ANGLE_DEGREES)})`,
    );
    expect(resolveNamespaceTint("docs", prefixes)).toContain(" 275)");
  });

  it("rounds the hue and wraps it past a full turn", () => {
    const five = ["ds", "cs", "docs", "ex", "geo"] as const;
    // 3 × 137.508 = 412.524 → 413 → 53; 4 × 137.508 = 550.032 → 550 → 190.
    expect(resolveNamespaceTint("ex", five)).toBe(
      "oklch(var(--mention-chip-tint-l, 0.45) var(--mention-chip-tint-c, 0.12) 53)",
    );
    expect(resolveNamespaceTint("geo", five)).toBe(
      "oklch(var(--mention-chip-tint-l, 0.45) var(--mention-chip-tint-c, 0.12) 190)",
    );
  });

  it("gives every prefix a distinct hue", () => {
    const tints = prefixes.map((prefix) =>
      resolveNamespaceTint(prefix, prefixes),
    );
    expect(new Set(tints).size).toBe(tints.length);
  });

  it("keeps every earlier prefix's tint when the list grows", () => {
    const grown = [...prefixes, "ex", "geo"];
    for (const prefix of prefixes) {
      expect(resolveNamespaceTint(prefix, grown)).toBe(
        resolveNamespaceTint(prefix, prefixes),
      );
    }
  });

  it("gives an unknown or absent namespace the neutral tint", () => {
    expect(resolveNamespaceTint("mystery", prefixes)).toContain(
      "--mention-chip-tint-unknown",
    );
    expect(resolveNamespaceTint(undefined, prefixes)).toContain(
      "--mention-chip-tint-unknown",
    );
    expect(resolveNamespaceTint("ds", [])).toContain(
      "--mention-chip-tint-unknown",
    );
  });

  it("gives the neutral tint the lightness every namespace tint falls back to", () => {
    expect(
      readHookFallback(
        resolveNamespaceTint("mystery", prefixes),
        "--mention-chip-tint-l",
      ),
    ).toBe(
      readHookFallback(
        resolveNamespaceTint("ds", prefixes),
        "--mention-chip-tint-l",
      ),
    );
  });
});

describe("buildMentionChipChannelStyle", () => {
  it("emits one custom property per channel", () => {
    const style = buildMentionChipChannelStyle({
      namespace: "ds",
      kind: "component",
      box: "instance",
      lifecycle: "canonical",
      prefixes: ["ds"],
    });
    expect(style["--mention-chip-tint"]).toContain("--mention-chip-tint-l");
    expect(style["--mention-chip-radius"]).not.toBe("");
    expect(style["--mention-chip-fill-weight"]).not.toBe("");
    expect(style["--mention-chip-stroke-weight"]).not.toBe("");
    expect(style["--mention-chip-dot"]).toContain(
      "--mention-chip-dot-canonical",
    );
  });

  it("swaps fill for stroke between instance and class", () => {
    const channels = {
      namespace: "ds",
      kind: "component",
      lifecycle: "none",
      prefixes: ["ds"],
    } as const;
    const instance = buildMentionChipChannelStyle({
      ...channels,
      box: "instance",
    });
    const klass = buildMentionChipChannelStyle({ ...channels, box: "class" });
    expect(instance["--mention-chip-fill-weight"]).not.toBe(
      klass["--mention-chip-fill-weight"],
    );
    expect(instance["--mention-chip-stroke-weight"]).not.toBe(
      klass["--mention-chip-stroke-weight"],
    );
  });

  it("maps the unmarked lifecycle to a transparent dot", () => {
    const style = buildMentionChipChannelStyle({
      namespace: "docs",
      kind: "term",
      box: "instance",
      lifecycle: "none",
      prefixes: ["docs"],
    });
    expect(style["--mention-chip-dot"]).toBe("transparent");
  });
});

/* ------------------------------------------------------------------ */
/* Contrast regression (WCAG AA)                                       */
/* ------------------------------------------------------------------ */

/*
 * The chip's text is the tint, and the instance fill is that same tint at
 * the fill weight, alpha-composited over the page background — so the pair
 * can silently converge when either value moves. Every namespace shares one
 * lightness and one chroma and differs only in hue, so the property to hold
 * is that EVERY hue clears AA: this suite sweeps the hue wheel at the
 * lightness, chroma and fill weight the hooks fall back to, the light values
 * this package ships. A site's dark theme defines its own hook values and
 * holds them to the same floor.
 *
 * oklch → sRGB uses Björn Ottosson's published OKLab ↔ linear-sRGB
 * matrices; alpha compositing happens in gamma-encoded sRGB, where the
 * browser composites; luminance and ratio follow WCAG 2.x.
 */

type Srgb = readonly [number, number, number];

/** Parses the first `oklch(L C H)` in a value (`%` lightness supported). */
function parseOklch(value: string): readonly [number, number, number] {
  const match = value.match(
    /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)/,
  );
  if (match === null) {
    throw new Error(`No oklch() colour in "${value}"`);
  }
  const rawLightness = Number(match.at(1));
  const lightness = match.at(2) === "%" ? rawLightness / 100 : rawLightness;
  return [lightness, Number(match.at(3)), Number(match.at(4))];
}

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

/** Alpha-composites `foreground` at `alpha` over an opaque `background`. */
function compositeOver(
  foreground: Srgb,
  alpha: number,
  background: Srgb,
): Srgb {
  const [foregroundRed, foregroundGreen, foregroundBlue] = foreground;
  const [backgroundRed, backgroundGreen, backgroundBlue] = background;
  return [
    alpha * foregroundRed + (1 - alpha) * backgroundRed,
    alpha * foregroundGreen + (1 - alpha) * backgroundGreen,
    alpha * foregroundBlue + (1 - alpha) * backgroundBlue,
  ];
}

function computeRelativeLuminance([red, green, blue]: Srgb): number {
  const linearizeChannel = (channel: number): number =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return (
    0.2126 * linearizeChannel(red) +
    0.7152 * linearizeChannel(green) +
    0.0722 * linearizeChannel(blue)
  );
}

function measureContrast(first: Srgb, second: Srgb): number {
  const firstLuminance = computeRelativeLuminance(first);
  const secondLuminance = computeRelativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

/** First percentage in a CSS value, as an alpha (`var(--x, 15%)` → 0.15). */
function parsePercentAsAlpha(value: string): number {
  const match = value.match(/([\d.]+)%/);
  if (match === null) {
    throw new Error(`No percentage in "${value}"`);
  }
  return Number(match.at(1)) / 100;
}

/** The fallback a `var(--name, fallback)` hook carries inside `value`. */
function readHookFallback(value: string, property: string): number {
  const match = value.match(new RegExp(`var\\(${property},\\s*([\\d.]+)\\)`));
  if (match === null) {
    throw new Error(`No ${property} fallback in "${value}"`);
  }
  return Number(match.at(1));
}

describe("instance chip contrast (WCAG AA)", () => {
  it("keeps text-vs-composited-fill at ≥ 4.5:1 for every hue at the fallbacks", () => {
    const tint = resolveNamespaceTint("ds", ["ds"]);
    // `--color-background` light: `--color-palette-white`.
    const background = convertOklchToSrgb(parseOklch("oklch(100% 0 0)"));
    const fillAlpha = parsePercentAsAlpha(
      getBoxEncoding("instance").fillWeight,
    );
    const lightness = readHookFallback(tint, "--mention-chip-tint-l");
    const chroma = readHookFallback(tint, "--mention-chip-tint-c");

    for (let hue = 0; hue < 360; hue += 15) {
      const text = convertOklchToSrgb([lightness, chroma, hue]);
      const fill = compositeOver(text, fillAlpha, background);
      expect(
        measureContrast(text, fill),
        `hue ${hue} on its instance fill`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
