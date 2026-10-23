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
 * - no grid template is authored: every `grid-template-columns` is a
 *   subgrid, so the explorer lands on the same ruler as the site's shell;
 * - no theme is named: a site's theme activates through its own classes;
 * - every component token reads another token, save the ones named here that
 *   hold the lens's own value where the design system has no semantic token,
 *   each pinned to that value;
 * - the tokens read from outside the lens are exactly the ones named here,
 *   each a semantic token of the design system or a hook the site defines,
 *   so a misspelt, invented or primitive name cannot sit unnoticed behind
 *   its fallback;
 * - every selector reaches a child through a role class, never through
 *   its element type, so a changed heading level or list element keeps
 *   its styling;
 * - every class a selector names is one the component's own sources write,
 *   or another lens component's root class, so a renamed role class cannot
 *   leave a rule that styles nothing;
 * - no rule declaration holds a unit-bearing literal, so every length, time
 *   and percentage that is a design decision lives in a component token,
 *   save the unthemable declarations named here.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
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
 * system has no semantic token for the decision, each with that value: two
 * layout measures, and the type sizes, the font families, the weights, the
 * tracking, the line heights, the radii, the stroke and edge widths, the
 * focus ring, the arrowhead, the opacities and the indicator size. Pinning
 * the value, not only the name, makes a changed corner, stroke or type size
 * a deliberate edit here rather than a silent one in a stylesheet.
 */
const LITERAL_TOKENS: Readonly<Record<string, string>> = {
  "--definitions-explorer-divider-width": "1px",
  "--definitions-explorer-search-font-size": "0.875rem",
  "--definitions-explorer-well-min-block-size": "12rem",
  "--explorer-controls-chip-border-width": "1px",
  "--explorer-controls-chip-font-size": "0.75rem",
  "--explorer-controls-chip-line-height": "1.4",
  "--explorer-controls-chip-outline-offset": "2px",
  "--explorer-controls-chip-outline-width": "2px",
  "--explorer-controls-chip-radius": "999px",
  "--explorer-controls-swatch-size": "0.5rem",
  "--explorer-status-bar-radius": "999px",
  "--explorer-status-font-size": "0.75rem",
  "--hierarchy-well-accent-width": "1.8",
  "--hierarchy-well-ambient-opacity": "0.35",
  "--hierarchy-well-caption-font-size": "0.9rem",
  "--hierarchy-well-caption-font-weight": "700",
  "--hierarchy-well-caption-letter-spacing": "0.12em",
  "--hierarchy-well-caption-opacity": "0.55",
  "--hierarchy-well-edge-faded-opacity": "0.06",
  "--hierarchy-well-hint-font-size": "0.75rem",
  "--hierarchy-well-hint-radius": "999px",
  "--hierarchy-well-label-font-family": '"Ubuntu Mono", monospace',
  "--hierarchy-well-label-font-size": "0.6875rem",
  "--hierarchy-well-label-halo-width": "3px",
  "--hierarchy-well-line-width": "1.4",
  "--lineage-line-height": "1.6",
  "--lineage-self-font-weight": "600",
  "--term-inspector-border-width": "1px",
  "--term-inspector-definition-font-size": "0.8125rem",
  "--term-inspector-font-size": "0.875rem",
  "--term-inspector-label-font-size": "0.75rem",
  "--term-inspector-label-letter-spacing": "0.05em",
  "--term-inspector-radius": "0.5rem",
  "--term-node-border-width": "1px",
  "--term-node-faded-opacity": "0.16",
  "--term-node-font-size": "0.875rem",
  "--term-node-radius": "0.5rem",
  "--term-node-selected-border-width": "2px",
  "--term-node-selected-font-weight": "600",
  "--term-node-tag-font-size": "0.5rem",
  "--term-node-tag-letter-spacing": "0.08em",
  "--term-rail-count-opacity": "0.75",
  "--term-rail-current-font-weight": "600",
  "--term-rail-depth-font-family": "ui-monospace, monospace",
  "--term-rail-depth-line-height": "1",
  "--term-rail-dimmed-opacity": "0.38",
  "--term-rail-font-size": "0.875rem",
  "--term-rail-item-radius": "0.4375rem",
  "--term-rail-label-font-size": "0.75rem",
  "--term-rail-label-letter-spacing": "0.05em",
  "--term-rail-mark-border-width": "1px",
  "--term-rail-mark-size": "0.5rem",
  "--term-rail-title-font-size": "1rem",
  "--well-legend-arrow-half-width": "3px",
  "--well-legend-arrow-length": "5px",
  "--well-legend-arrow-overhang": "1px",
  "--well-legend-border-width": "1px",
  "--well-legend-font-size": "0.6875rem",
  "--well-legend-max-inline-size": "15rem",
  "--well-legend-radius": "0.5rem",
  "--well-legend-swatch-radius": "0.1875rem",
};

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

/**
 * List the component tokens a stylesheet's `:root` declares with no `var()`,
 * as `[name, value]` pairs with the value's whitespace collapsed.
 */
function listLiteralTokens(css: string): [string, string][] {
  const root = css.match(/:root\s*\{([^}]*)\}/)?.at(1) ?? "";
  return [...root.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)]
    .map((match): [string, string] => [
      match.at(1) ?? "",
      (match.at(2) ?? "").replaceAll(/\s+/g, " ").trim(),
    ])
    .filter(([, value]) => !value.includes("var("));
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
 * List the selectors that address an element by its type: any compound
 * selector, past the first, that opens with an element name.
 */
function listTypeSelectors(css: string): string[] {
  return [...css.matchAll(/([^{};]+)\{/g)]
    .map((match) => (match.at(1) ?? "").trim())
    .filter((prelude) => !prelude.startsWith("@") && prelude !== ":root")
    .flatMap((prelude) => prelude.split(","))
    .map((selector) => selector.trim())
    .filter((selector) =>
      selector
        .split(/\s*[\s>+~]\s*/)
        .slice(1)
        .some((compound) => /^[a-z]/.test(compound)),
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

/** Collect the non-test TypeScript sources under `directory`, recursively. */
function collectSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) return collectSources(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [full]
      : [];
  });
}

/**
 * List the class-shaped words a source's string literals hold: every quoted
 * and template string, split on anything a class name cannot contain.
 */
function listStringWords(source: string): string[] {
  return [...source.matchAll(/"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g)].flatMap(
    (match) =>
      (match.at(1) ?? match.at(2) ?? match.at(3) ?? "").split(/[^a-z0-9-]+/),
  );
}

/**
 * List the classes a stylesheet's rule selectors name, the `ds` namespace
 * left out. At-rule preludes and the `:root` token block name none.
 */
function listSelectedClasses(css: string): string[] {
  const rules = css.replace(/:root\s*\{[^}]*\}/, "");
  return [...rules.matchAll(/([^{};]+)\{/g)]
    .map((match) => (match.at(1) ?? "").trim())
    .filter((prelude) => !prelude.startsWith("@"))
    .flatMap((prelude) => [...prelude.matchAll(/\.([a-z][a-z0-9-]*)/g)])
    .map((match) => match.at(1) ?? "")
    .filter((name) => name !== "ds");
}

/** List the root classes a stylesheet names: each compounded with `.ds`. */
function listRootClasses(css: string): string[] {
  return [...css.matchAll(/\.ds\.([a-z][a-z0-9-]*)/g)].map(
    (match) => match.at(1) ?? "",
  );
}

/**
 * The directory of the component a stylesheet belongs to: the top-level
 * folder under the library, so a part under `common/` shares its owner's
 * sources (a state class may be named in the owner's constants).
 */
function resolveComponentDirectory(file: string): string {
  const component = relative(LIBRARY_DIRECTORY, file).split(sep).at(0);
  if (component === undefined) throw new Error(`${file} is outside the lens`);
  return join(LIBRARY_DIRECTORY, component);
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

  it("author no grid template: every template is a subgrid", () => {
    const templates = files.flatMap((file) =>
      [...readCss(file).matchAll(/grid-template-columns:\s*([^;]+);/g)].map(
        (match) => (match.at(1) ?? "").trim(),
      ),
    );
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.filter((value) => value !== "subgrid")).toEqual([]);
  });

  it("name no theme", () => {
    for (const file of files) {
      const css = readCss(file);
      expect(css, file).not.toMatch(/\.(?:dark|light)\b/);
      expect(css, file).not.toMatch(/prefers-color-scheme/);
    }
  });

  it("bind every component token to another token, save the pinned literals", () => {
    const literal = files.flatMap((file) => listLiteralTokens(readCss(file)));
    expect(Object.fromEntries(literal)).toEqual(LITERAL_TOKENS);
    // Two stylesheets declaring one name would collapse into one entry above.
    expect(literal.length).toBe(Object.keys(LITERAL_TOKENS).length);
  });

  it("read from outside the lens exactly the tokens named here", () => {
    const external = new Set(
      files.flatMap((file) => listExternalTokens(readCss(file))),
    );
    expect([...external].toSorted()).toEqual(EXTERNAL_TOKENS);
  });

  it("address every child by class, never by element type", () => {
    expect(files.flatMap((file) => listTypeSelectors(readCss(file)))).toEqual(
      [],
    );
    expect(
      listTypeSelectors(".ds.probe h2, .ds.probe > .heading { margin: 0; }"),
    ).toEqual([".ds.probe h2"]);
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

  it("select only the classes the components write", () => {
    const roots = new Set(
      files.flatMap((file) => listRootClasses(readCss(file))),
    );
    const unwritten = files.flatMap((file) => {
      const written = new Set(
        collectSources(resolveComponentDirectory(file)).flatMap((source) =>
          listStringWords(readFileSync(source, "utf8")),
        ),
      );
      return [...new Set(listSelectedClasses(readCss(file)))]
        .filter((name) => !written.has(name) && !roots.has(name))
        .map((name) => `${relative(LIBRARY_DIRECTORY, file)}: .${name}`);
    });
    expect(unwritten).toEqual([]);
  });

  it("tell a selected class from a written one", () => {
    expect(
      listSelectedClasses(
        "@layer ds.prism { :root { --probe: 0; } .ds.probe .subhead:hover, .ds.probe.is-on { margin: 0; } }",
      ),
    ).toEqual(["probe", "subhead", "probe", "is-on"]);
    expect(
      listStringWords('<h3 className="subheading">{`ds probe`}</h3>'),
    ).toEqual(expect.arrayContaining(["subheading", "ds", "probe"]));
    expect(listStringWords('<h3 className="subheading" />')).not.toContain(
      "subhead",
    );
  });

  it("paint in the prism layer, never in a site's", () => {
    for (const file of files) {
      expect(readCss(file), file).toMatch(/^\s*@layer ds\.prism \{/);
    }
  });
});
