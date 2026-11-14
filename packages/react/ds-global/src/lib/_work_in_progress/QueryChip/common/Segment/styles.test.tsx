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

const CONDITIONS = ["inclusion", "exclusion", "match", "range", "presence"];

describe("Segment stylesheet", () => {
  it("sits in the ds.components.global layer", () => {
    expect(source).toMatch(/^@layer ds\.components\.global \{/m);
  });

  it("declares no tokens of its own: they are the chip's", () => {
    expect(sheet).not.toMatch(/:root/);
    expect(sheet).not.toMatch(/--query-chip-[\w-]+:/);
  });

  it("is a 24 by 24 px target at least", () => {
    const base = findDeclarations(".ds.query-chip-segment");
    expect(base).toContain("min-inline-size: var(--dimension-300);");
    expect(base).toContain("min-block-size: var(--dimension-300);");
  });

  it("takes a chip-wide state first, then the modifier channels", () => {
    const base = findDeclarations(".ds.query-chip-segment");
    expect(base).toContain(
      "background: var( --query-chip-segment-state-background, var( --modifier-color-foreground-secondary, var(--query-chip-segment-background) ) );",
    );
    expect(base).toContain(
      "color: var( --modifier-color-text-onForegroundSecondary, var(--query-chip-segment-text) );",
    );
  });

  it("binds the plain steps for its own states, from data attributes", () => {
    expect(findDeclarations("&[data-invalid]")).toBe(
      " color: var(--color-text-onForegroundSecondary-error); background: var(--query-chip-segment-background-invalid);",
    );
    expect(findDeclarations("&:is(button):enabled:hover")).toBe(
      " background: var(--query-chip-segment-background-hover);",
    );
    expect(sheet).not.toContain("aria-selected");
  });

  it("shapes the glyph from the icon channel, never naming a glyph", () => {
    expect(findDeclarations("& > .glyph")).toContain(
      "mask: var(--modifier-icon) center / contain no-repeat;",
    );
    expect(findDeclarations("& > .glyph.error")).toBe(
      " background-color: var(--color-icon-onForegroundSecondary-error);",
    );
  });

  it("gives each Condition value its own block of channels and a mark", () => {
    for (const condition of CONDITIONS) {
      const block = findDeclarations(`.ds.query-chip-segment.${condition}`);
      for (const channel of [
        "--modifier-color-foreground-secondary",
        "--modifier-color-text-onForegroundSecondary",
        "--modifier-color-icon",
        "--modifier-icon",
      ]) {
        expect(block, `${condition} ${channel}`).toContain(`${channel}:`);
      }
    }
  });

  it("aliases Exclusion to a tone distinct from the other values'", () => {
    const findTone = (condition: string) =>
      findDeclarations(`.ds.query-chip-segment.${condition}`).match(
        /--modifier-color-foreground-secondary: var\( (--[\w-]+) \)/,
      )?.[1];
    expect(new Set(CONDITIONS.map(findTone))).toEqual(
      new Set([
        "--color-foreground-secondary-information",
        "--color-foreground-secondary-warning",
      ]),
    );
    expect(findTone("exclusion")).toBe("--color-foreground-secondary-warning");
  });

  it("takes the icon set's glyphs where they exist", () => {
    expect(findDeclarations(".ds.query-chip-segment.match")).toContain(
      'url("/icons/search.svg#search")',
    );
    expect(findDeclarations(".ds.query-chip-segment.presence")).toContain(
      'url("/icons/status-small.svg#status-small")',
    );
  });
});
