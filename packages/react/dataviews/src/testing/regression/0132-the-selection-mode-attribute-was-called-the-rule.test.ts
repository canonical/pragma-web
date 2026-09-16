/**
 * The table's anatomy recorded `data-status` as a deviation from the code
 * standards, which write a custom state as a class, and in the same file
 * called `data-selection-mode` — the same pattern — what the rule asks for.
 * It also said a caller's own maximum height wins over a virtualized
 * table's cap, where the stylesheet says nothing a caller passes raises it.
 *
 * Both attributes are recorded as deviations, and the cap is stated as the
 * stylesheet applies it.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const anatomy = readFileSync(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../lib/_work_in_progress/DataTable/DataTable.anatomy.yaml",
  ),
  "utf8",
);

describe("the table's anatomy", () => {
  it("records the selection mode attribute as the status is recorded", () => {
    const deviations = anatomy.slice(
      anatomy.indexOf("# Deviations the DSL cannot express"),
    );
    expect(deviations).toMatch(/`data-status`/);
    expect(deviations).toMatch(/`data-selection-mode`/);
    expect(anatomy).not.toMatch(/so an attribute, never a class/);
  });

  it("states the virtualized cap as the stylesheet applies it", () => {
    expect(anatomy).not.toMatch(/a caller's own maximum wins/);
    expect(anatomy).toMatch(/nothing a caller passes raises it/);
  });
});
