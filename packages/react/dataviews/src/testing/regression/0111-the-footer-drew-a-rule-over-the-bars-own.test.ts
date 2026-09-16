/**
 * The table's footer drew a top rule and a surface of its own, and the
 * pagination bar it holds draws both too, so the bar sat under a doubled
 * rule. It also drew beneath the table's header and refusal reasons where
 * the two overlapped, having no stacking of its own.
 *
 * The footer draws nothing — the bar draws its surface and rule — and stacks
 * above the table.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const footer =
  readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../lib/_work_in_progress/DataTable/styles.css",
    ),
    "utf8",
  )
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .match(/\.ds\.data-table\s*>\s*\.footer\s*\{([^{}]*)\}/)?.[1] ?? "";

describe("the table's footer", () => {
  it("draws no rule or surface, and stacks above the table", () => {
    expect(footer).toMatch(/position:\s*sticky;/);
    expect(footer).not.toMatch(/border|background/);
    expect(footer).toMatch(/z-index:\s*1;/);
  });
});
