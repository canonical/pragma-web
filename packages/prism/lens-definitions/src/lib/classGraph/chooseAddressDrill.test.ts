import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../testing/fixtures.js";
import metroGraph from "../../../testing/records/metroGraph.js";
import chooseAddressDrill from "./chooseAddressDrill.js";

describe("chooseAddressDrill", () => {
  it("drills into the namespace the address's expand names", () => {
    expect(chooseAddressDrill(FOUR_NAMESPACE_GRAPH, "surface", undefined)).toBe(
      "surface",
    );
    expect(chooseAddressDrill(metroGraph, "geo", undefined)).toBe("geo");
  });

  it("drills into nothing for an unknown prefix or no parameter", () => {
    expect(
      chooseAddressDrill(FOUR_NAMESPACE_GRAPH, "nowhere", undefined),
    ).toBeUndefined();
    expect(chooseAddressDrill(FOUR_NAMESPACE_GRAPH, "", undefined)).toBe(
      undefined,
    );
    expect(
      chooseAddressDrill(FOUR_NAMESPACE_GRAPH, undefined, undefined),
    ).toBeUndefined();
  });

  it("ignores the parameter on a term page", () => {
    expect(
      chooseAddressDrill(FOUR_NAMESPACE_GRAPH, "surface", "ds:UIBlock"),
    ).toBeUndefined();
  });
});
