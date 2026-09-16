/**
 * The word beside a not-applicable dash is read and not drawn, so it was
 * clipped — to a box of no size. Some screen readers pass over a box of no
 * size, which undid the reason for clipping it rather than hiding it.
 *
 * It is clipped to the standard one-pixel box, its margin taken back, in the
 * table's stylesheet and the cards' alike.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = path.dirname(fileURLToPath(import.meta.url));

const ruleOf = (sheet: string, selector: RegExp): string =>
  readFileSync(path.join(here, sheet), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .match(new RegExp(`${selector.source}\\s*\\{([^{}]*)`))?.[1] ?? "";

describe("the not-applicable word's box", () => {
  it("is one pixel with its margin taken back, never none", () => {
    for (const rule of [
      ruleOf(
        "../../lib/_work_in_progress/DataTable/styles.css",
        /& > \.not-applicable/,
      ),
      ruleOf(
        "../../lib/_work_in_progress/Cards/styles.css",
        /& \.data-card \.not-applicable/,
      ),
    ]) {
      expect(rule).toMatch(/inline-size:\s*1px;/);
      expect(rule).toMatch(/block-size:\s*1px;/);
      expect(rule).toMatch(/margin:\s*-1px;/);
      expect(rule).toMatch(/clip-path:\s*inset\(50%\);/);
    }
  });
});
