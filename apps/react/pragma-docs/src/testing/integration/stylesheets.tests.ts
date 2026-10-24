// @vitest-environment node

/**
 * The stylesheet invariants the intrinsic grid rests on, read straight off
 * the app's own stylesheets:
 *
 * - the layout's shared tokens are each DEFINED exactly once (regions
 *   consume, never re-define), and the dissolved width tokens are absent;
 * - no grid template is authored in the app: the shell's root takes the
 *   design system's intrinsic columns from the `grid intrinsic` preset
 *   classes, and every grid below it is a subgrid;
 * - no conditional at-rule that can reflow layout exists in the app but a
 *   container query on the shell at a whole number of column groups
 *   (`@container shell (width < 448px)`, 912px or 1376px): a region that
 *   must change shape below a group count asks the one query container
 *   the layouts read, at the thresholds the archetypes use, and
 *   `assertStylesheets` checks each such query's threshold and the comment
 *   naming its group count. No `@media` query reflows and no `@supports`
 *   gates layout. Feature queries that cannot reflow layout
 *   (`prefers-color-scheme`, `forced-colors`, `prefers-reduced-motion`) are
 *   exempt, matched by query TEXT, never by file — and only while no other
 *   condition rides along in the prelude.
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

  // The four z-axis strata the explorers read. Each defined exactly once,
  // in styles/app.css.
  it.each(["--z-underground", "--z-plate", "--z-chrome", "--z-overlay"])(
    "defines %s exactly once across src/**/*.css",
    (token) => {
      const definitions = allCss.match(new RegExp(`${token}\\s*:`, "g")) ?? [];
      expect(definitions).toHaveLength(1);
    },
  );

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

  // THE INTRINSIC-GRID INVARIANT (owner ruling: one grid, everything below
  // it a subgrid). The app authors NO grid template: the shell's root takes
  // the intrinsic columns from the `grid intrinsic` preset classes, and
  // every `grid-template-columns` the app declares, without exception, is
  // `subgrid`. A stray template, or a read of the intrinsic columns
  // anywhere, trips it.
  it("authors no grid template — every grid in the app is a subgrid", () => {
    // Strip CSS comments first, so a property token quoted in a comment
    // (describing the model) is not miscounted as real CSS.
    const templates = cssFiles.flatMap((file) =>
      [
        ...readFileSync(file, "utf8")
          .replaceAll(/\/\*[\s\S]*?\*\//g, "")
          .matchAll(/grid-template-columns:\s*([^;]+);/g),
      ].map((match) => ({ file, value: (match.at(1) ?? "").trim() })),
    );

    expect(templates.length).toBeGreaterThan(0);
    expect(
      templates.filter(({ value }) => !value.startsWith("subgrid")),
    ).toEqual([]);
    expect(allCss).not.toContain("--grid-intrinsic");
  });

  /**
   * The layout-capable census. Every conditional at-rule prelude
   * (`@media` / `@container` / `@supports`) counts unless it is a media
   * query built ONLY of feature queries that cannot reflow layout by
   * design (`prefers-color-scheme`, `forced-colors`,
   * `prefers-reduced-motion`), or a container query on the shell at a
   * whole number of column groups. The media exemption matches query TEXT,
   * never files: stripping the exempt features from the prelude must leave
   * no condition behind, so an exempt feature riding with a width term is
   * still caught. `@supports` always counts: it can gate layout.
   */
  const layoutCapableConditionals = (): string[] =>
    (allCss.match(/@(?:media|container|supports)[^{]*/g) ?? []).filter(
      (prelude) => {
        if (prelude.startsWith("@container")) {
          return !/^@container shell \(width < (?:448|912|1376)px\)\s*$/.test(
            prelude,
          );
        }
        if (!prelude.startsWith("@media")) return true;
        const residue = prelude.replaceAll(
          /\((?:prefers-color-scheme|forced-colors|prefers-reduced-motion)[^)]*\)/g,
          "",
        );
        return residue.includes("(");
      },
    );

  it("authors no layout-capable conditional at-rule but a shell query at a whole group", () => {
    expect(layoutCapableConditionals()).toEqual([]);
  });
});
