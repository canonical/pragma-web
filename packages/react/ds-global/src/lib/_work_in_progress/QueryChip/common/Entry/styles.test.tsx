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

describe("Entry stylesheet", () => {
  it("sits in the ds.components.global layer", () => {
    expect(source).toMatch(/^@layer ds\.components\.global \{/m);
  });

  it("declares no tokens of its own: they are the chip's", () => {
    expect(sheet).not.toMatch(/:root/);
    expect(sheet).not.toMatch(/--query-chip-[\w-]+:/);
  });

  it("has its own look, 24 px tall at least", () => {
    const base = findDeclarations(".ds.query-chip-entry");
    expect(base).toContain("background: var(--query-chip-entry-background);");
    expect(base).toContain("min-block-size: var(--dimension-300);");
  });

  it("grows its input with what is typed", () => {
    expect(findDeclarations("& > .input")).toContain("field-sizing: content;");
  });

  it("outlines an entry at fault in the error border", () => {
    expect(findDeclarations("&[data-invalid]")).toContain(
      "var(--color-border-error)",
    );
  });
});
