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
 *   subgrid, so the index lands on the same ruler as the site's shell;
 * - no theme is named: a site's theme activates through its own classes;
 * - every component token reads another token, save the ones named here that
 *   hold the lens's own value where the design system has no semantic token;
 * - the tokens read from outside the lens are exactly the ones named here,
 *   each a semantic token of the design system or a hook the site defines,
 *   so a misspelt, invented or primitive name cannot sit unnoticed behind
 *   its fallback;
 * - every selector reaches a child through a role class, never through
 *   its element type, so a changed heading level or list element keeps
 *   its styling;
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
 * system has no semantic token for the decision: the reading measure.
 */
const LITERAL_TOKENS = ["--standard-article-max-inline-size"];

/**
 * The tokens the lens reads from outside itself: the design system's
 * semantic colour and space tokens, and the grid's gutter. No primitive
 * token is among them: a component token reads the semantic tier or holds
 * its own value.
 */
const EXTERNAL_TOKENS = [
  "--color-text-muted",
  "--grid-gutter",
  "--space-100",
  "--space-200",
  "--space-300",
];

/** The lens's own custom properties: each component's tokens. */
const LENS_PROPERTY = /^--(?:standards-|standard-)/;

/**
 * The rule declarations that may hold a unit-bearing literal, because none
 * is a design decision: the visually hidden idiom's one-pixel clip. A bare
 * `0` carries no unit.
 */
const UNTHEMABLE_DECLARATIONS = [
  "block-size: 1px",
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

describe("the lens stylesheets", () => {
  it("are found", () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
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
    expect(templates.filter((value) => value !== "subgrid")).toEqual([]);
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

  it("paint in the prism layer, never in a site's", () => {
    for (const file of files) {
      expect(readCss(file), file).toMatch(/^\s*@layer ds\.prism \{/);
    }
  });
});
