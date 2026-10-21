import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BOXES,
  CHANNEL_DESCRIPTORS,
  CHANNELS,
  GOLDEN_ANGLE_DEGREES,
  KINDS,
  LIFECYCLES,
} from "./constants.js";
import {
  assertNonEmptyString,
  buildChipChannelStyle,
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
      expect(row.label).not.toBe("");
      expect(row.shape).not.toBe("");
    }
  });

  it("resolves a row for every box", () => {
    for (const box of BOXES) {
      const row = getBoxEncoding(box);
      expect(row.value).toBe(box);
      expect(row.label).not.toBe("");
    }
  });

  it("resolves a row for every lifecycle", () => {
    for (const lifecycle of LIFECYCLES) {
      const row = getLifecycleEncoding(lifecycle);
      expect(row.value).toBe(lifecycle);
      expect(row.label).not.toBe("");
    }
  });

  it("describes every channel exactly once", () => {
    expect(CHANNEL_DESCRIPTORS.map((row) => row.value)).toStrictEqual([
      ...CHANNELS,
    ]);
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
      'Chip: "uri" must be a non-empty string',
    );
    expect(() => assertNonEmptyString(7, "label")).toThrow(
      'Chip: "label" must be a non-empty string',
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
      "oklch(var(--chip-tint-l, 0.45) var(--chip-tint-c, 0.12) 0)",
    );
    expect(resolveNamespaceTint("cs", prefixes)).toBe(
      `oklch(var(--chip-tint-l, 0.45) var(--chip-tint-c, 0.12) ${Math.round(GOLDEN_ANGLE_DEGREES)})`,
    );
    expect(resolveNamespaceTint("docs", prefixes)).toContain(" 275)");
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
      "--chip-tint-unknown",
    );
    expect(resolveNamespaceTint(undefined, prefixes)).toContain(
      "--chip-tint-unknown",
    );
    expect(resolveNamespaceTint("ds", [])).toContain("--chip-tint-unknown");
  });
});

describe("buildChipChannelStyle", () => {
  it("emits one custom property per channel", () => {
    const style = buildChipChannelStyle({
      namespace: "ds",
      kind: "component",
      box: "instance",
      lifecycle: "canonical",
      prefixes: ["ds"],
    });
    expect(style["--chip-tint"]).toContain("--chip-tint-l");
    expect(style["--chip-radius"]).not.toBe("");
    expect(style["--chip-fill-weight"]).not.toBe("");
    expect(style["--chip-stroke-weight"]).not.toBe("");
    expect(style["--chip-dot"]).toContain("--chip-dot-canonical");
  });

  it("swaps fill for stroke between instance and class", () => {
    const channels = {
      namespace: "ds",
      kind: "component",
      lifecycle: "none",
      prefixes: ["ds"],
    } as const;
    const instance = buildChipChannelStyle({ ...channels, box: "instance" });
    const klass = buildChipChannelStyle({ ...channels, box: "class" });
    expect(instance["--chip-fill-weight"]).not.toBe(
      klass["--chip-fill-weight"],
    );
    expect(instance["--chip-stroke-weight"]).not.toBe(
      klass["--chip-stroke-weight"],
    );
  });

  it("maps the unmarked lifecycle to a transparent dot", () => {
    const style = buildChipChannelStyle({
      namespace: "docs",
      kind: "term",
      box: "instance",
      lifecycle: "none",
      prefixes: ["docs"],
    });
    expect(style["--chip-dot"]).toBe("transparent");
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
 * is that EVERY hue clears AA: this suite sweeps the hue wheel at both
 * themes' lightness and chroma, light values from the tint's fallbacks,
 * dark values parsed from the dark hooks in `styles.css`.
 *
 * oklch → sRGB uses Björn Ottosson's published OKLab ↔ linear-sRGB
 * matrices; alpha compositing happens in gamma-encoded sRGB, where the
 * browser composites; luminance and ratio follow WCAG 2.x.
 */

type Srgb = readonly [number, number, number];

/**
 * The stylesheet's source, for parsing the dark theme hooks — the real
 * shipped values, not a copy. Read beside this test file (vitest's
 * `testPath`, so the read is independent of the runner's cwd; a plain
 * `import.meta.url` is not a file URL under the jsdom environment, and
 * vitest stubs CSS imports even with `?raw`).
 */
function readStylesCss(): string {
  const testPath = expect.getState().testPath;
  if (typeof testPath !== "string") {
    throw new Error("vitest did not expose the current test path");
  }
  return readFileSync(join(dirname(testPath), "styles.css"), "utf-8");
}

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

function oklchToSrgb([lightness, chroma, hueDegrees]: readonly [
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
  const toGamma = (linear: number): number => {
    const clamped = Math.min(1, Math.max(0, linear));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * clamped ** (1 / 2.4) - 0.055;
  };
  return [
    toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/** Alpha-composites `foreground` at `alpha` over an opaque `background`. */
function compositeOver(
  foreground: Srgb,
  alpha: number,
  background: Srgb,
): Srgb {
  return [
    alpha * foreground[0] + (1 - alpha) * background[0],
    alpha * foreground[1] + (1 - alpha) * background[1],
    alpha * foreground[2] + (1 - alpha) * background[2],
  ];
}

function relativeLuminance([red, green, blue]: Srgb): number {
  const linear = (channel: number): number =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function contrastRatio(first: Srgb, second: Srgb): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The value a dark theme hook declares in `styles.css`. The hook appears in
 * both dark blocks (`:root.dark` and the `prefers-color-scheme` fallback);
 * all occurrences must agree or the two dark paths have drifted apart.
 */
function readDarkHookValue(property: string): string {
  const values = [
    ...readStylesCss().matchAll(new RegExp(`${property}:\\s*([^;]+);`, "g")),
  ].map((match) => (match.at(1) ?? "").trim());
  expect(values.length, `${property} declared in styles.css`).toBeGreaterThan(
    0,
  );
  expect(new Set(values).size, `${property} agrees across dark blocks`).toBe(1);
  return values.at(0) ?? "";
}

/** First percentage in a CSS value, as an alpha (`var(--x, 15%)` → 0.15). */
function parsePercentAsAlpha(value: string): number {
  const match = value.match(/([\d.]+)%/);
  if (match === null) {
    throw new Error(`No percentage in "${value}"`);
  }
  return Number(match.at(1)) / 100;
}

/** The first number in a CSS value (`var(--x, 0.45)` → 0.45). */
function parseNumber(value: string): number {
  const match = value.match(/(\d*\.?\d+)(?!.*\d)/);
  if (match === null) {
    throw new Error(`No number in "${value}"`);
  }
  return Number(match.at(1));
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
  it("keeps text-vs-composited-fill at ≥ 4.5:1 for every hue × theme", () => {
    const lightTint = resolveNamespaceTint("ds", ["ds"]);
    const themes = {
      light: {
        // `--color-background` light: `--color-palette-white`.
        background: parseOklch("oklch(100% 0 0)"),
        fillAlpha: parsePercentAsAlpha(getBoxEncoding("instance").fillWeight),
        lightness: readHookFallback(lightTint, "--chip-tint-l"),
        chroma: readHookFallback(lightTint, "--chip-tint-c"),
      },
      dark: {
        // `--color-background` dark: `--color-palette-gray-930`.
        background: parseOklch("oklch(23.08% 0 0)"),
        fillAlpha: parsePercentAsAlpha(
          readDarkHookValue("--chip-fill-weight-instance"),
        ),
        lightness: parseNumber(readDarkHookValue("--chip-tint-l")),
        chroma: parseNumber(readDarkHookValue("--chip-tint-c")),
      },
    } as const;

    for (const [themeName, theme] of Object.entries(themes)) {
      for (let hue = 0; hue < 360; hue += 15) {
        const text = oklchToSrgb([theme.lightness, theme.chroma, hue]);
        const fill = compositeOver(
          text,
          theme.fillAlpha,
          oklchToSrgb(theme.background),
        );
        expect(
          contrastRatio(text, fill),
          `hue ${hue} on its instance fill (${themeName})`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
