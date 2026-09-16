/**
 * A held touch on a selectable row is the row's long press, but the
 * stylesheet left the platform's own gestures for a held touch in place:
 * iOS selects the text under the finger and offers its callout, and the
 * press and the platform fought over the same gesture. Only the context
 * menu event was declined, which iOS never sends for touch.
 *
 * On a coarse pointer, a selectable row declines text selection and the
 * callout; rows of a table that offers no selection keep their text
 * selectable.
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

describe("a selectable row on a coarse pointer", () => {
  it("declines the platform's text selection and callout", () => {
    const coarse = sheet.match(
      /@media \(pointer: coarse\)\s*\{\s*&\[aria-selected\]\s*\{([^}]*)\}/,
    )?.[1];
    expect(coarse).toMatch(/-webkit-touch-callout:\s*none;/);
    expect(coarse).toMatch(/user-select:\s*none;/);
    // Not on every row: only one that carries aria-selected is selectable.
    expect(sheet).not.toMatch(/\.ds\.data-table-row\s*\{[^}]*user-select/);
  });
});
