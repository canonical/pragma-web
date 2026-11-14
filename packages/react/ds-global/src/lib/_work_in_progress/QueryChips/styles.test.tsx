/** The stylesheet's contract, which jsdom cannot lay out. */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = path.dirname(fileURLToPath(import.meta.url));

/** The sheet as written, comments included. */
const source = readFileSync(path.join(here, "styles.css"), "utf8");

// Comments and the layer name dropped, whitespace collapsed.
const sheet = source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/@layer[^{;]*/g, "")
  .replace(/\s+/g, " ");

describe("QueryChips stylesheet", () => {
  it("sits in the ds.components.global layer", () => {
    expect(source).toMatch(/^@layer ds\.components\.global \{/m);
  });

  it("keeps its token on the root class, with no :root rule", () => {
    expect(sheet).not.toMatch(/:root/);
    expect(sheet).toContain(
      ".ds.query-chips { --query-chips-gap: var(--dimension-100);",
    );
  });

  it("wraps the chips 8 px apart, as a list with no bullets or indent", () => {
    for (const declaration of [
      "display: flex;",
      "flex-wrap: wrap;",
      "gap: var(--query-chips-gap);",
      "list-style: none;",
      "margin: 0;",
      "padding: 0;",
    ]) {
      expect(sheet).toContain(declaration);
    }
  });
});
