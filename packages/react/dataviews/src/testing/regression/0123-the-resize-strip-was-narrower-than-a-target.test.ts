/**
 * Regression: the resize handle's strip is wide enough to be a target.
 *
 * Before the fix, the strip was 16px wide. Once a heading ellipsized, the
 * column menu's button sat beside it with too little space between their
 * centres, so neither met WCAG 2.5.8's target size. The strip is now 24px,
 * which meets it on size alone at every density, with the hairline still
 * the mark it shows.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const sheet = readFileSync(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../lib/_work_in_progress/DataTable/styles.css",
  ),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

describe("regression 0123 — the resize strip was narrower than a target", () => {
  it("draws the strip 24px wide", () => {
    const rule = sheet
      .match(/\.ds\.data-table-resize-handle \{[^}]*?& > \.strip \{([^{}]*)/)
      ?.at(1);
    expect(rule).toMatch(/inline-size:\s*var\(--dimension-300\);/);
  });
});
