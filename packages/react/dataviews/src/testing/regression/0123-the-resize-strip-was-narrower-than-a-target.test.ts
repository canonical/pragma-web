/**
 * Regression: the resize handle's strip is wide enough to be a target.
 *
 * Before the fix, the strip was 16px wide. Once a heading ellipsized, the
 * column menu's button sat beside it with too little space between their
 * centres, so neither met WCAG 2.5.8's target size. The strip is now 24px,
 * which meets it on size alone at every density, with the hairline still
 * the mark it shows.
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

/** One rule of the sheet: the selectors it resolves to, and its declarations. */
type ResolvedRule = {
  readonly selectors: readonly string[];
  readonly declarations: string;
};

/** The selectors a nested selector list resolves to under its parents'. */
const resolveSelectors = (
  own: string,
  parents: readonly string[],
): readonly string[] => {
  if (own.startsWith("@")) {
    return parents;
  }
  const parts = own.split(",").map((part) => part.trim());
  if (parents.length === 0) {
    return parts;
  }
  return parents.flatMap((parent) =>
    parts.map((part) =>
      part.includes("&") ? part.replaceAll("&", parent) : `${parent} ${part}`,
    ),
  );
};

/**
 * Every rule of the sheet with its selectors resolved through nesting, so a
 * rule is found by what it selects, however the sheet happens to nest it.
 */
const resolveRules = (css: string): readonly ResolvedRule[] => {
  const rules: ResolvedRule[] = [];
  const open: { selectors: readonly string[]; declarations: string }[] = [];
  let buffer = "";
  for (const char of css) {
    if (char === "{") {
      // What precedes the selector in the buffer is the parent's own
      // declarations, ended by their last semicolon.
      const end = buffer.lastIndexOf(";") + 1;
      const parent = open.at(-1);
      if (parent !== undefined) {
        parent.declarations += buffer.slice(0, end);
      }
      const own = buffer.slice(end).replace(/\s+/g, " ").trim();
      open.push({
        selectors: resolveSelectors(own, parent?.selectors ?? []),
        declarations: "",
      });
      buffer = "";
    } else if (char === "}") {
      const closed = open.pop();
      if (closed !== undefined) {
        rules.push({
          selectors: closed.selectors,
          declarations: closed.declarations + buffer,
        });
      }
      buffer = "";
    } else {
      buffer += char;
    }
  }
  return rules;
};

describe("regression 0123 — the resize strip was narrower than a target", () => {
  it("draws the strip 24px wide", () => {
    const strip = resolveRules(sheet).filter(({ selectors }) =>
      selectors.some((selector) =>
        /\.ds\.data-table-resize-handle\s*>\s*\.strip$/.test(selector),
      ),
    );
    expect(strip).not.toEqual([]);
    expect(strip.map(({ declarations }) => declarations).join(";")).toMatch(
      /inline-size:\s*var\(--dimension-300\);/,
    );
  });
});
