import { describe, expect, it } from "vitest";
import resolveRenderers from "./resolveRenderers.js";
import type { Renderer, RendererFacts } from "./types.js";

const table: Renderer<string> = {
  name: "table",
  label: "Table",
  render: (text) => `table ${text}`,
};
const cards: Renderer<string> = {
  name: "cards",
  label: "Cards",
  render: (text) => `cards ${text}`,
};
const turtle: Renderer<string> = {
  name: "turtle",
  label: "Turtle",
  render: () => "turtle",
  offered: ({ extensions }) => extensions.has("source"),
};
const defaults = [table, cards, turtle];
const withSource: RendererFacts = { extensions: new Set(["source"]) };
const withoutSource: RendererFacts = { extensions: new Set() };

describe("resolveRenderers", () => {
  it("offers the site's defaults when the lens declares nothing", () => {
    expect(resolveRenderers(undefined, defaults, withSource)).toEqual(defaults);
  });

  it("resolves names to the defaults, in the declaration's order", () => {
    expect(resolveRenderers(["cards", "table"], defaults, withSource)).toEqual([
      cards,
      table,
    ]);
  });

  it("disables a default the lens leaves out", () => {
    expect(resolveRenderers(["table"], defaults, withSource)).toEqual([table]);
  });

  it("takes a renderer of the lens's own as given, under its name", () => {
    const graph: Renderer<string> = {
      name: "drawing",
      label: "Graph",
      render: () => "graph",
    };
    const resolved = resolveRenderers(
      ["table", { name: "graph", renderer: graph }],
      defaults,
      withSource,
    );
    expect(resolved.map(({ name }) => name)).toEqual(["table", "graph"]);
    expect(resolved.at(1)?.render("x")).toBe("graph");
  });

  it("overloads a default by its name", () => {
    const rows: Renderer<string> = {
      name: "table",
      label: "Rows",
      render: () => "rows",
    };
    const resolved = resolveRenderers(
      [{ name: "table", renderer: rows }, "cards"],
      defaults,
      withSource,
    );
    expect(resolved.at(0)?.label).toBe("Rows");
    expect(resolved.at(1)).toBe(cards);
  });

  it("leaves out a renderer the data does not allow", () => {
    expect(
      resolveRenderers(undefined, defaults, withoutSource).map(
        ({ name }) => name,
      ),
    ).toEqual(["table", "cards"]);
    expect(
      resolveRenderers(["table", "turtle"], defaults, withSource).map(
        ({ name }) => name,
      ),
    ).toEqual(["table", "turtle"]);
  });

  it("throws on a name the site has no default for", () => {
    expect(() => resolveRenderers(["graph"], defaults, withSource)).toThrow(
      'renderer "graph" is not a site default',
    );
  });
});
