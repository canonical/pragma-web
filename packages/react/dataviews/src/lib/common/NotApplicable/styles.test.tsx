import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** The not-applicable word's stylesheet, without its comments. */
const sheet = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "styles.css"),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

describe("NotApplicable stylesheet", () => {
  it("clips the word to a one-pixel box, its margin taken back", () => {
    const rule = sheet
      .match(/\.ds\.data-views-not-applicable \{([^{}]*)\}/)
      ?.at(1);
    expect(rule).toBeDefined();
    expect(rule).toMatch(/position:\s*absolute;/);
    expect(rule).toMatch(/inline-size:\s*1px;\s*block-size:\s*1px;/);
    expect(rule).toMatch(/margin:\s*-1px;/);
    expect(rule).toMatch(/clip-path:\s*inset\(50%\);/);
    // Clipped, never removed from the accessibility tree.
    expect(rule).not.toMatch(/display:\s*none|visibility:\s*hidden/);
  });
});
