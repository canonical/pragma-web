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
 *   hold the lens's own value where the design system has no semantic token;
 * - the tokens read from outside the lens are exactly the ones named here,
 *   each a semantic token of the design system or a hook the site defines,
 *   so a misspelt, invented or primitive name cannot sit unnoticed behind
 *   its fallback;
 * - no rule declaration holds a unit-bearing literal, so every length, time
 *   and percentage that is a design decision lives in a component token,
 *   save the unthemable declarations named here.
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
 * system has no semantic token for the decision: two layout measures, and
 * the type sizes, the font families, the weights, the tracking, the line
 * heights, the radii, the stroke and edge widths, the focus ring, the
 * arrowhead, the opacities and the indicator size.
 */
const LITERAL_TOKENS = [
  "--definitions-explorer-divider-width",
  "--definitions-explorer-search-font-size",
  "--definitions-explorer-well-min-block-size",
  "--explorer-controls-chip-border-width",
  "--explorer-controls-chip-font-size",
  "--explorer-controls-chip-line-height",
  "--explorer-controls-chip-outline-offset",
  "--explorer-controls-chip-outline-width",
  "--explorer-controls-chip-radius",
  "--explorer-controls-swatch-size",
  "--explorer-status-bar-radius",
  "--explorer-status-font-size",
  "--hierarchy-well-accent-width",
  "--hierarchy-well-ambient-opacity",
  "--hierarchy-well-caption-font-size",
  "--hierarchy-well-caption-font-weight",
  "--hierarchy-well-caption-letter-spacing",
  "--hierarchy-well-caption-opacity",
  "--hierarchy-well-edge-faded-opacity",
  "--hierarchy-well-hint-font-size",
  "--hierarchy-well-hint-radius",
  "--hierarchy-well-label-font-family",
  "--hierarchy-well-label-font-size",
  "--hierarchy-well-label-halo-width",
  "--hierarchy-well-line-width",
  "--lineage-line-height",
  "--lineage-self-font-weight",
  "--term-inspector-border-width",
  "--term-inspector-definition-font-size",
  "--term-inspector-font-size",
  "--term-inspector-label-font-size",
  "--term-inspector-label-letter-spacing",
  "--term-inspector-radius",
  "--term-node-border-width",
  "--term-node-faded-opacity",
  "--term-node-font-size",
  "--term-node-radius",
  "--term-node-selected-border-width",
  "--term-node-selected-font-weight",
  "--term-node-tag-font-size",
  "--term-node-tag-letter-spacing",
  "--term-rail-count-opacity",
  "--term-rail-current-font-weight",
  "--term-rail-depth-font-family",
  "--term-rail-depth-line-height",
  "--term-rail-dimmed-opacity",
  "--term-rail-font-size",
  "--term-rail-item-radius",
  "--term-rail-label-font-size",
  "--term-rail-label-letter-spacing",
  "--term-rail-mark-border-width",
  "--term-rail-mark-size",
  "--term-rail-title-font-size",
  "--well-legend-arrow-half-width",
  "--well-legend-arrow-length",
  "--well-legend-arrow-overhang",
  "--well-legend-border-width",
  "--well-legend-font-size",
  "--well-legend-max-inline-size",
  "--well-legend-radius",
  "--well-legend-swatch-radius",
];

/**
 * The tokens the lens reads from outside itself: the design system's
 * semantic colour, space and motion tokens, and the site's grid preset,
 * strata and underground surface. No primitive token is among them: a
 * component token reads the semantic tier or holds its own value.
 */
const EXTERNAL_TOKENS = [
  "--color-background",
  "--color-background-contrasted",
  "--color-border",
  "--color-border-muted",
  "--color-text",
  "--color-text-branded",
  "--color-text-muted",
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
  "--z-plate",
  "--z-underground",
];

/** The lens's own custom properties: each component's tokens and the
 * per-element properties its rules and its markup set. */
const LENS_PROPERTY =
  /^--(?:definitions-|explorer-|hierarchy-well-|lineage-|term-|well-legend-)/;

/**
 * The rule declarations that may hold a unit-bearing literal, because none
 * is a design decision: the visually hidden idiom's one-pixel clip, a
 * circle's half-box radius, and the layout root filling the viewport. A
 * bare `0` carries no unit.
 */
const UNTHEMABLE_DECLARATIONS = [
  "block-size: 100dvh",
  "block-size: 1px",
  "border-radius: 50%",
  "clip-path: inset(50%)",
  "inline-size: 1px",
  "margin: -1px",
];

/**
 * The literals unthemable in any declaration: `100%` fills the containing
 * block and `1fr` the grid's free space.
 */
const UNTHEMABLE_LITERALS = ["100%", "1fr"];

/** A number with a unit: a length, a time, an angle or a percentage. */
const UNIT_LITERAL = /(?<![\w.-])-?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]+)(?![\w-])/g;

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
 * List the rule declarations, outside the `:root` component tokens, that
 * hold a unit-bearing literal, as `property: value`, the unthemable
 * declarations and literals left out.
 */
function listRawDecisions(css: string): string[] {
  const rules = css.replace(/:root\s*\{[^}]*\}/, "");
  return [...rules.matchAll(/(-{0,2}[a-z][a-z0-9-]*)\s*:\s*([^;{}]+);/g)]
    .filter((match) => !(match.at(1) ?? "").startsWith("--"))
    .map(
      (match) =>
        `${match.at(1)}: ${(match.at(2) ?? "").replaceAll(/\s+/g, " ").trim()}`,
    )
    .filter((declaration) => !UNTHEMABLE_DECLARATIONS.includes(declaration))
    .filter((declaration) =>
      (declaration.match(UNIT_LITERAL) ?? []).some(
        (literal) => !UNTHEMABLE_LITERALS.includes(literal),
      ),
    );
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

  it("hold no design decision outside a component token", () => {
    expect(files.flatMap((file) => listRawDecisions(readCss(file)))).toEqual(
      [],
    );
  });

  it("tell a raw decision from an unthemable declaration", () => {
    expect(
      listRawDecisions(
        ".ds.probe { outline: 2px solid red; inline-size: 100%; margin: 0; }",
      ),
    ).toEqual(["outline: 2px solid red"]);
    expect(
      listRawDecisions(
        ":root { --probe-width: 2px; } .ds.probe { margin: -1px; --probe-gap: 1rem; }",
      ),
    ).toEqual([]);
  });

  it("paint in the prism layer, never in a site's", () => {
    for (const file of files) {
      expect(readCss(file), file).toMatch(/^\s*@layer ds\.prism \{/);
    }
  });
});
