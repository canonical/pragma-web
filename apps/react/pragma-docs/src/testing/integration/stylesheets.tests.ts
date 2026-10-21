// @vitest-environment node

/**
 * The stylesheet invariants the intrinsic grid rests on, read straight off
 * the app's own stylesheets:
 *
 * - the layout's shared tokens are each DEFINED exactly once (regions
 *   consume, never re-define), and the dissolved width tokens are absent;
 * - no grid template is authored in the app: each lens layout's root reads
 *   the design system's intrinsic columns (`var(--grid-intrinsic)`), and
 *   every other grid is a subgrid;
 * - exactly one LAYOUT-CAPABLE conditional at-rule exists: the sanctioned
 *   AX.1 collapse in Rail/styles.css. Feature queries that cannot reflow
 *   layout (`prefers-color-scheme`, `forced-colors`,
 *   `prefers-reduced-motion`) are exempt, matched by query TEXT, never by
 *   file — and only while no other condition rides along in the prelude.
 */

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** Recursively collect the app's own stylesheets. */
const collectCss = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return collectCss(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });

describe("the app stylesheets", () => {
  const srcDir = fileURLToPath(new URL("../..", import.meta.url));
  const cssFiles = collectCss(srcDir);
  const allCss = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  it("finds the app stylesheets", () => {
    expect(cssFiles.length).toBeGreaterThanOrEqual(4);
  });

  // The metric tokens that SURVIVE the strict intrinsic-grid model: the
  // strip's block-axis height and the four z-axis strata. Each defined
  // exactly once, in styles/app.css.
  it.each([
    "--strip-h",
    "--z-underground",
    "--z-plate",
    "--z-chrome",
    "--z-overlay",
  ])("defines %s exactly once across src/**/*.css", (token) => {
    const definitions = allCss.match(new RegExp(`${token}\\s*:`, "g")) ?? [];
    expect(definitions).toHaveLength(1);
  });

  // The inline-axis WIDTH tokens are DISSOLVED under the strict
  // intrinsic-grid model (owner ruling 2026-07-22): there are no named
  // column widths any more — the layout provides unnamed intrinsic columns
  // and every region claims its width by SPANNING them. These tokens must
  // not exist anywhere; a reintroduction is a regression toward the old
  // fixed-track frame.
  it.each(["--rail-w", "--subnav-w", "--aside-w"])(
    "does NOT define %s — the width tokens are dissolved (span, not token)",
    (token) => {
      const definitions = allCss.match(new RegExp(`${token}\\s*:`, "g")) ?? [];
      expect(definitions).toHaveLength(0);
    },
  );

  // THE INTRINSIC-GRID INVARIANT (the strict model's teeth, owner ruling
  // 2026-07-22: EVERYTHING is a subgrid, no exceptions). The app authors NO
  // grid template of its own. The columns are the design system's intrinsic
  // grid (`--grid-intrinsic`, from @canonical/styles), read only at a lens
  // layout's root, so every lens lands on the same ruler. Every OTHER
  // `grid-template-columns` declaration, without exception, is `subgrid`:
  // pages, explorers, region tenants, card grids, list grids, ALL of them
  // inherit the layout's columns and spend spans. This is the assertion that
  // catches the "looks like one column" regression AND any stray leaf
  // template: a grid that authors a template (or reads the intrinsic columns
  // anywhere but a layout's root) trips it.
  it("authors no grid template — lens layout roots read the intrinsic columns; every other grid is a subgrid", () => {
    // Strip CSS comments first, so a property token quoted in a comment
    // (describing the model) is not miscounted as real CSS.
    const authored = cssFiles.flatMap((file) =>
      [
        ...readFileSync(file, "utf8")
          .replaceAll(/\/\*[\s\S]*?\*\//g, "")
          .matchAll(/grid-template-columns:\s*([^;]+);/g),
      ]
        .map((match) => {
          const value = match.at(1);
          if (value === undefined) {
            throw new Error(`${file} has a grid template with no value`);
          }
          return value.trim();
        })
        .filter((value) => !value.startsWith("subgrid") && value !== "inherit")
        .map((value) => ({ file, value })),
    );

    expect(authored.length).toBeGreaterThan(0);
    for (const { file, value } of authored) {
      expect(value, `${file} reads the intrinsic columns`).toBe(
        "var(--grid-intrinsic)",
      );
      expect(file, "only a lens layout's root reads them").toMatch(
        /\/[A-Z]\w*Layout\/styles\.css$/,
      );
    }
  });

  /**
   * The layout-capable census. Every conditional at-rule prelude
   * (`@media` / `@container` / `@supports`) counts unless it is a media
   * query built ONLY of feature queries that cannot reflow layout by
   * design: `prefers-color-scheme`, `forced-colors`,
   * `prefers-reduced-motion`. The exemption matches query TEXT, never
   * files: stripping the exempt features from the prelude must leave no
   * condition behind, so an exempt feature riding with a width term is
   * still caught. `@container` and `@supports` always count — both can
   * gate layout.
   */
  const layoutCapableConditionals = (): string[] =>
    (allCss.match(/@(?:media|container|supports)[^{]*/g) ?? []).filter(
      (prelude) => {
        if (!prelude.startsWith("@media")) return true;
        const residue = prelude.replaceAll(
          /\((?:prefers-color-scheme|forced-colors|prefers-reduced-motion)[^)]*\)/g,
          "",
        );
        return residue.includes("(");
      },
    );

  it("allows exactly one layout-capable conditional at-rule — the sanctioned AX.1 collapse", () => {
    const conditionals = layoutCapableConditionals();
    expect(conditionals).toHaveLength(1);
    expect(conditionals.at(0)).toMatch(/^@media[^{]*max-width/);
  });
});
