import { describe, expect, it } from "vitest";
import { readQueriedValues } from "./readQueriedValues.js";

describe("readQueriedValues", () => {
  it("reads leaves as text and nodes by title and IRI, item by item", () => {
    expect(
      readQueriedValues(
        {
          platforms: 4,
          zone: { uri: "ex:z1", _meta: { title: "Zone 1" } },
          lines: [{ uri: "ex:red", _meta: { title: "Red" } }],
          position: { _meta: { title: "DiagramPoint" } },
        },
        ["platforms", "zone", "lines", "position"],
      ),
    ).toEqual({
      platforms: [{ text: "4", uri: null }],
      zone: [{ text: "Zone 1", uri: "ex:z1" }],
      lines: [{ text: "Red", uri: "ex:red" }],
      position: [{ text: "DiagramPoint", uri: null }],
    });
  });

  it("reads a missing node, a null field and an unqueried one as none", () => {
    expect(readQueriedValues(null, ["name"])).toEqual({ name: [] });
    expect(readQueriedValues({ name: null }, ["name", "zone"])).toEqual({
      name: [],
      zone: [],
    });
  });
});
