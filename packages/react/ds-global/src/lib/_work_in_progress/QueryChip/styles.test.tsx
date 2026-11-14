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

/** The declarations directly inside the first block opened by `selector`. */
const findDeclarations = (selector: string): string => {
  const start = sheet.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No rule for "${selector}".`);
  const body = sheet.slice(start + selector.length + 2);
  return body.slice(0, body.search(/[{}]/)).replace(/[^;]*$/, "");
};

/** The custom properties a declaration list sets, by name. */
const listTokens = (declarations: string): Map<string, string> =>
  new Map(
    [...declarations.matchAll(/(--[\w-]+): ([^;]+);/g)].map(
      ([, name, value]) => [name as string, value as string],
    ),
  );

describe("QueryChip stylesheet", () => {
  it("sits in the ds.components.global layer", () => {
    expect(source).toMatch(/^@layer ds\.components\.global \{/m);
  });

  it("keeps its tokens on the root class, with no :root rule", () => {
    expect(sheet).not.toMatch(/:root/);
    const tokens = listTokens(findDeclarations(".ds.query-chip"));
    for (const name of [
      "--query-chip-background",
      "--query-chip-border-color",
      "--query-chip-radius",
      "--query-chip-min-height",
      "--query-chip-separation",
      "--query-chip-segment-background",
      "--query-chip-segment-background-selected",
      "--query-chip-segment-text",
      "--query-chip-segment-padding-inline",
      "--query-chip-entry-background",
      "--query-chip-remove-size",
    ]) {
      expect(tokens.has(name), name).toBe(true);
    }
  });

  it("separates the parts by 2 px of the surface beneath", () => {
    const tokens = listTokens(findDeclarations(".ds.query-chip"));
    expect(tokens.get("--query-chip-background")).toBe("transparent");
    expect(tokens.get("--query-chip-separation")).toBe("var(--dimension-025)");
    expect(findDeclarations("& > .body")).toContain(
      "gap: var(--query-chip-separation);",
    );
  });

  it("joins the parts by a 1 px line, the body's fill, as tokens only", () => {
    const tokens = listTokens(findDeclarations(".ds.query-chip.joined"));
    expect(tokens.get("--query-chip-background")).toBe("#c5c5c5");
    expect(tokens.get("--query-chip-separation")).toBe(
      "var(--dimension-stroke-thickness-medium)",
    );
    expect(tokens.get("--query-chip-min-height")).toBe("1.625rem");
    expect(
      findDeclarations(".ds.query-chip.joined")
        .replace(/--[\w-]+: [^;]+;/g, "")
        .trim(),
    ).toBe("");
  });

  it("makes a joined chip one target for hover and fault", () => {
    expect(findDeclarations("& > .body:has(> button:enabled:hover)")).toBe(
      " --query-chip-segment-state-background: var( --query-chip-segment-background-hover );",
    );
    expect(findDeclarations("& > .body:has(> [data-invalid])")).toContain(
      "--query-chip-border-color: var(--color-border-error);",
    );
  });

  it("selects the segments while focus is on one, not on the entry", () => {
    expect(
      findDeclarations(
        "& > .body:focus-within:not(:has(> .ds.query-chip-entry))",
      ),
    ).toBe(
      " --query-chip-segment-state-background: var( --query-chip-segment-background-selected );",
    );
  });

  it("draws one 3 px ring outside the body while focus is within it", () => {
    expect(findDeclarations("& > .body:focus-within")).toBe(
      " outline: var(--query-chip-ring-width) solid var(--query-chip-ring-color); outline-offset: var(--query-chip-ring-offset);",
    );
    expect(
      listTokens(findDeclarations(".ds.query-chip")).get(
        "--query-chip-ring-width",
      ),
    ).toBe("var(--dimension-stroke-thickness-large)");
  });

  it("gives the body and the remove control 24 px at least", () => {
    const tokens = listTokens(findDeclarations(".ds.query-chip"));
    expect(tokens.get("--query-chip-min-height")).toBe("var(--dimension-300)");
    expect(tokens.get("--query-chip-remove-size")).toBe("var(--dimension-300)");
    const remove = findDeclarations("& > .remove");
    expect(remove).toContain("min-inline-size: var(--query-chip-remove-size);");
    expect(remove).toContain("min-block-size: var(--query-chip-remove-size);");
    expect(remove).toContain(
      "background: var(--query-chip-remove-background);",
    );
  });

  it("marks a refused chip's first segment from the error scope", () => {
    expect(
      findDeclarations(
        "&.error > .body > .ds.query-chip-segment:first-child::before",
      ),
    ).toContain("mask: var(--modifier-icon) center / contain no-repeat;");
  });
});
