// @vitest-environment node

/**
 * The stylesheet invariants the lens's layout rests on, read straight off
 * its own stylesheets:
 *
 * - no LAYOUT-CAPABLE conditional at-rule exists: the lens never reshapes
 *   itself on the viewport or a container. Feature queries that cannot
 *   reflow layout (`prefers-color-scheme`, `forced-colors`,
 *   `prefers-reduced-motion`) are exempt, matched by query TEXT, never by
 *   file, and only while no other condition rides along in the prelude;
 * - no grid template is authored but the layout's root, which reads the
 *   design system's intrinsic columns: every other `grid-template-columns`
 *   is a subgrid, so the explorer lands on the same ruler as the site;
 * - no theme is named: a site's theme activates through its own classes;
 * - every component token reads another token, save the ones named here that
 *   hold the lens's own value where the design system has no token;
 * - the tokens read from outside the lens are exactly the ones named here,
 *   each defined by the design system's stylesheets or by the site, so a
 *   misspelt or invented name cannot sit unnoticed behind its fallback.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** The lens's source tree, two levels up from this file. */
const LIBRARY_DIRECTORY = fileURLToPath(new URL("../../lib", import.meta.url));

/** Collect the stylesheets under `directory`, recursively. */
function collectCss(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) return collectCss(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

/** Read a stylesheet with its comments stripped. */
function readCss(file: string): string {
  return readFileSync(file, "utf8").replaceAll(/\/\*[\s\S]*?\*\//g, "");
}

const files = collectCss(LIBRARY_DIRECTORY);

/**
 * The component tokens that hold the lens's own value, because the design
 * system has no token for the decision: two layout measures, and the type
 * sizes off the system's scale, the weights, the tracking, the opacities,
 * the indicator size and the edge widths.
 */
const LITERAL_TOKENS = [
  "--definitions-explorer-well-min-block-size",
  "--explorer-controls-swatch-size",
  "--hierarchy-well-accent-width",
  "--hierarchy-well-ambient-opacity",
  "--hierarchy-well-caption-font-size",
  "--hierarchy-well-caption-font-weight",
  "--hierarchy-well-caption-letter-spacing",
  "--hierarchy-well-caption-opacity",
  "--hierarchy-well-edge-faded-opacity",
  "--hierarchy-well-label-font-size",
  "--hierarchy-well-line-width",
  "--lineage-self-font-weight",
  "--term-inspector-definition-font-size",
  "--term-node-faded-opacity",
  "--term-node-selected-font-weight",
  "--term-node-tag-font-size",
  "--term-node-tag-letter-spacing",
  "--term-rail-count-opacity",
  "--term-rail-current-font-weight",
  "--term-rail-dimmed-opacity",
  "--term-rail-mark-size",
  "--well-legend-font-size",
  "--well-legend-max-inline-size",
];

/**
 * The tokens the lens reads from outside itself: the design system's
 * `@canonical/styles` tokens, and the site's grid preset, strata and
 * underground surface.
 */
const EXTERNAL_TOKENS = [
  "--color-background",
  "--color-background-contrasted",
  "--color-border",
  "--color-border-muted",
  "--color-text",
  "--color-text-branded",
  "--color-text-muted",
  "--dimension-letter-spacing-wide",
  "--dimension-radius-full",
  "--dimension-radius-medium",
  "--dimension-radius-small",
  "--dimension-size-font-size-250",
  "--dimension-size-font-size-300",
  "--dimension-size-font-size-350",
  "--dimension-stroke-thickness-large",
  "--dimension-stroke-thickness-medium",
  "--grid-intrinsic",
  "--motion-duration-fast",
  "--space-025",
  "--space-050",
  "--space-100",
  "--space-150",
  "--space-200",
  "--space-300",
  "--space-800",
  "--surface-underground-background",
  "--typography-font-family-monospace",
  "--z-plate",
  "--z-underground",
];

/** The lens's own custom properties: each component's tokens and the
 * per-element properties its rules and its markup set. */
const LENS_PROPERTY =
  /^--(?:definitions-|explorer-|hierarchy-well-|lineage-|term-|well-legend-)/;

/** List every custom property a stylesheet reads from outside the lens. */
function listExternalTokens(css: string): string[] {
  return [...css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)]
    .map((match) => match.at(1) ?? "")
    .filter((name) => !LENS_PROPERTY.test(name));
}

/** List the component tokens a stylesheet's `:root` declares with no `var()`. */
function listLiteralTokens(css: string): string[] {
  const root = css.match(/:root\s*\{([^}]*)\}/)?.at(1) ?? "";
  return [...root.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)]
    .filter((match) => !(match.at(2) ?? "").includes("var("))
    .map((match) => match.at(1) ?? "");
}

/**
 * List the conditional at-rule preludes that can gate layout: every
 * `@container` and `@supports`, and every `@media` that keeps a condition
 * once the exempt feature queries are stripped from it.
 */
function listLayoutCapableConditionals(css: string): string[] {
  return (css.match(/@(?:media|container|supports)[^{]*/g) ?? []).filter(
    (prelude) => {
      if (!prelude.startsWith("@media")) return true;
      const residue = prelude.replaceAll(
        /\((?:prefers-color-scheme|forced-colors|prefers-reduced-motion)[^)]*\)/g,
        "",
      );
      return residue.includes("(");
    },
  );
}

describe("the lens stylesheets", () => {
  it("are found", () => {
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  it("carry no layout-capable conditional at-rule", () => {
    expect(
      files.flatMap((file) => listLayoutCapableConditionals(readCss(file))),
    ).toEqual([]);
  });

  it("author no grid template but the layout root's intrinsic columns", () => {
    const templates = files.flatMap((file) =>
      [...readCss(file).matchAll(/grid-template-columns:\s*([^;]+);/g)].map(
        (match) => ({ file, value: (match.at(1) ?? "").trim() }),
      ),
    );
    const authored = templates.filter(({ value }) => value !== "subgrid");

    expect(templates.length).toBeGreaterThan(authored.length);
    expect(authored).toEqual([
      {
        file: join(LIBRARY_DIRECTORY, "DefinitionsLayout", "styles.css"),
        value: "var(--grid-intrinsic)",
      },
    ]);
  });

  it("name no theme", () => {
    for (const file of files) {
      const css = readCss(file);
      expect(css, file).not.toMatch(/\.(?:dark|light)\b/);
      expect(css, file).not.toMatch(/prefers-color-scheme/);
    }
  });

  it("bind every component token to another token", () => {
    const literal = files.flatMap((file) => listLiteralTokens(readCss(file)));
    expect(literal.toSorted()).toEqual(LITERAL_TOKENS);
  });

  it("read from outside the lens exactly the tokens named here", () => {
    const external = new Set(
      files.flatMap((file) => listExternalTokens(readCss(file))),
    );
    expect([...external].toSorted()).toEqual(EXTERNAL_TOKENS);
  });

  it("paint in the prism layer, never in a site's", () => {
    for (const file of files) {
      expect(readCss(file), file).toMatch(/^\s*@layer ds\.prism \{/);
    }
  });
});
