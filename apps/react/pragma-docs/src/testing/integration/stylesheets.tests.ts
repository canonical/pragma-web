// @vitest-environment node

/**
 * The stylesheet invariants the intrinsic grid rests on, read straight off
 * the app's own stylesheets:
 *
 * - the layout's shared tokens are each DEFINED exactly once (regions
 *   consume, never re-define), and the dissolved width tokens are absent;
 * - exactly ONE grid template is authored in the app — the lens layout's
 *   intrinsic columns — and every other grid is a subgrid;
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
  // exactly once, in LensLayout/styles.css.
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
  // 2026-07-22: EVERYTHING is a subgrid, no exceptions). Exactly ONE grid
  // TEMPLATE exists in the whole app — the layout's intrinsic columns. Every
  // OTHER `grid-template-columns` declaration, without exception, is
  // `subgrid`: pages, explorers, region tenants, card grids, list grids,
  // ALL of them inherit the layout's columns and spend spans. Nothing authors
  // its own template, not even a leaf card-grid (no `auto-fill minmax(Nrem)`
  // anywhere but the layout). This is the assertion that catches the "looks
  // like one column" regression AND any stray leaf template: a grid that
  // authors a template (or is `display: block` in the chain) trips it.
  it("authors exactly ONE grid template — the layout's; every other grid is a subgrid, no exceptions", () => {
    // Strip CSS comments first, so a property token quoted in a comment
    // (describing the model) is not miscounted as real CSS.
    const cssNoComments = allCss.replaceAll(/\/\*[\s\S]*?\*\//g, "");
    const authored = [
      ...cssNoComments.matchAll(/grid-template-columns:\s*([^;]+);/g),
    ]
      .map((m) => m[1].trim())
      .filter((value) => !value.startsWith("subgrid") && value !== "inherit");

    // EXACTLY ONE authored template, full stop — and it is the layout's
    // intrinsic grid: an auto-fill of FOUR `minmax(var(--grid-col-min…))`
    // columns. Everything else in the app is `subgrid`.
    expect(authored).toHaveLength(1);
    expect(authored[0]).toMatch(/^repeat\(\s*auto-fill/);
    expect(
      (authored[0].match(/minmax\(\s*var\(--grid-col-min/g) ?? []).length,
    ).toBe(4);
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
    expect(conditionals[0]).toMatch(/^@media[^{]*max-width/);
  });
});
