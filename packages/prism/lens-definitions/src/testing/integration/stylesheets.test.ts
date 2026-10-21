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
 * - every component token reads another token, so a site retunes the lens
 *   through the semantic tier, save the literal layout measures named here.
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

/** The component tokens that hold a literal layout measure on purpose. */
const LITERAL_TOKENS = [
  "--definitions-explorer-well-min-block-size",
  "--well-legend-max-inline-size",
];

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

  it("paint in the prism layer, never in a site's", () => {
    for (const file of files) {
      expect(readCss(file), file).toMatch(/^\s*@layer ds\.prism \{/);
    }
  });
});
