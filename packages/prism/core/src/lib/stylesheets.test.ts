// @vitest-environment node

/**
 * The stylesheet invariants the package's chrome rests on, read straight off
 * its own stylesheets:
 *
 * - exactly one LAYOUT-CAPABLE conditional at-rule exists: the rail's
 *   small-viewport collapse. Feature queries that cannot reflow layout
 *   (`prefers-color-scheme`, `forced-colors`, `prefers-reduced-motion`) are
 *   exempt, matched by query TEXT, never by file, and only while no other
 *   condition rides along in the prelude;
 * - no grid template is authored: every `grid-template-columns` is a
 *   subgrid, so the chrome inherits the site layout's columns;
 * - no theme is named: a site's theme activates through its own classes and
 *   defines the hooks the stylesheets fall back from.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

/** Collect the stylesheets under `dir`, recursively. */
function collectCss(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectCss(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

/** Read every stylesheet beside this test, with its comments stripped. */
function readLibraryCss(): string {
  const testPath = expect.getState().testPath;
  if (typeof testPath !== "string") {
    throw new Error("vitest did not expose the current test path");
  }
  const files = collectCss(dirname(testPath));
  expect(files.length, "stylesheets found").toBeGreaterThanOrEqual(6);
  return files
    .map((file) =>
      readFileSync(file, "utf8").replaceAll(/\/\*[\s\S]*?\*\//g, ""),
    )
    .join("\n");
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

describe("the package stylesheets", () => {
  it("carry exactly one layout-capable conditional at-rule, the rail's collapse", () => {
    const conditionals = listLayoutCapableConditionals(readLibraryCss());
    expect(conditionals).toHaveLength(1);
    expect(conditionals.at(0)).toMatch(/^@media\s*\(max-width:/);
  });

  it("author no grid template: every grid is a subgrid", () => {
    const templates = [
      ...readLibraryCss().matchAll(/grid-template-columns:\s*([^;]+);/g),
    ].map((match) => (match.at(1) ?? "").trim());
    expect(templates.length).toBeGreaterThan(0);
    for (const template of templates) {
      expect(template).toBe("subgrid");
    }
  });

  it("name no theme", () => {
    const css = readLibraryCss();
    expect(css).not.toMatch(/\.(?:dark|light)\b/);
    expect(css).not.toMatch(/prefers-color-scheme/);
  });
});
