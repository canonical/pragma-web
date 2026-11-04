import { describe, expect, it } from "vitest";
import readRenderer from "./readRenderer.js";
import type { Renderer } from "./types.js";

const table: Renderer<void> = {
  name: "table",
  label: "Table",
  render: () => null,
};
const cards: Renderer<void> = {
  name: "cards",
  label: "Cards",
  render: () => null,
};

describe("readRenderer", () => {
  it("reads the renderer the address names", () => {
    expect(readRenderer("cards", [table, cards])).toBe(cards);
  });

  it("reads the first renderer when the address names none", () => {
    expect(readRenderer(null, [table, cards])).toBe(table);
  });

  it("reads the first renderer for a name the view does not offer", () => {
    expect(readRenderer("graph", [table, cards])).toBe(table);
  });

  it("throws when the view offers no renderer", () => {
    expect(() => readRenderer("table", [])).toThrow(
      "readRenderer: the view offers no renderer",
    );
  });
});
