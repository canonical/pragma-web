import { describe, expect, it } from "vitest";
import buildRendererSearch from "./buildRendererSearch.js";

describe("buildRendererSearch", () => {
  it("sets the renderer and keeps the search and the facets", () => {
    expect(
      buildRendererSearch({ q: "cen", zone: "1" }, "cards", "table"),
    ).toEqual({ q: "cen", zone: "1", as: "cards", expand: undefined });
  });

  it("leaves the renderer out of the default's address", () => {
    expect(
      buildRendererSearch({ as: "cards", q: "cen" }, "table", "table"),
    ).toEqual({ as: undefined, q: "cen", expand: undefined });
  });

  it("drops the expanded relation and keeps the graph state", () => {
    expect(
      buildRendererSearch(
        { graph: "orbit", select: "ds:a", expand: "ds:a:p:out" },
        "graph",
        "table",
      ),
    ).toEqual({
      graph: "orbit",
      select: "ds:a",
      as: "graph",
      expand: undefined,
    });
  });
});
