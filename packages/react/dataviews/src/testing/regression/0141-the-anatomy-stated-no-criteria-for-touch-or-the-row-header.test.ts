/**
 * The table's anatomy states the WCAG criteria each accessible part meets,
 * and named none for the row header or for selection on touch: a long press
 * completing on a timer, and a column naming every row, went unaccounted.
 *
 * Both are stated with their criteria.
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

describe("the table's accessibility statement", () => {
  it("states the row header and selection on touch with their criteria", () => {
    const statement = anatomy.slice(anatomy.indexOf("# Accessibility"));
    expect(statement).toMatch(
      /row header cell\s+"DataTable row header" \(1\.3\.1, 4\.1\.2\)/,
    );
    expect(statement).toMatch(
      /selection mode\s+"Selection on touch" \(2\.1\.1, 2\.5\.1, 2\.5\.2, 4\.1\.3\)/,
    );
  });
});
