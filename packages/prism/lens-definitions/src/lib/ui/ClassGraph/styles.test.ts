import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** The component's stylesheet, its comments removed. */
const css = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "styles.css"),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

/** Every innermost rule: its selector and its declarations. */
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
  ([, selector = "", body = ""]) => ({
    selector: selector.trim().replace(/\s+/g, " "),
    body,
  }),
);

describe("ClassGraph styles", () => {
  it("gives a relation with no statements no colour of its own: its dash says it", () => {
    const colouring = rules
      .filter(
        ({ selector, body }) =>
          /\.(relation|filled-head)\b/.test(selector) &&
          /(^|[;\s])(color|stroke|fill)\s*:/.test(body),
      )
      .map(({ selector }) => selector);
    expect(colouring).toEqual([
      ".ds.class-graph .relation",
      ".ds.class-graph .relation.is-focus",
      ".ds.class-graph .filled-head",
      ".ds.class-graph .filled-head.is-focus",
    ]);
    expect(css).not.toMatch(/is-zero|zero-color/);
  });
});
