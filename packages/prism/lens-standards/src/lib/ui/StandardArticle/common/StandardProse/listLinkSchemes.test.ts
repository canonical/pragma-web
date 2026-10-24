import { describe, expect, it } from "vitest";
import listLinkSchemes from "./listLinkSchemes.js";

/** An edge to a node whose compact address is `curie`. */
const buildEdge = (curie: string) => ({ node: { _meta: { curie } } });

describe("listLinkSchemes", () => {
  it("lists each reference's prefix once, sorted", () => {
    expect(
      listLinkSchemes([
        buildEdge("ds:global.component.button"),
        buildEdge("cs:code.array.safe_access"),
        buildEdge("cs:react.component.props"),
      ]),
    ).toEqual(["cs", "ds"]);
  });

  it("leaves out a prefix that cannot be a link scheme", () => {
    expect(
      listLinkSchemes([buildEdge("Metro:Line"), buildEdge("geo_x:Zone")]),
    ).toEqual([]);
  });

  it("leaves out a prefix Markdown refuses to keep", () => {
    expect(
      listLinkSchemes([buildEdge("data:set"), buildEdge("file:a")]),
    ).toEqual([]);
  });

  it("reads no prefix off an address with no colon", () => {
    expect(listLinkSchemes([buildEdge("orphan")])).toEqual([]);
  });

  it("lists nothing for no references", () => {
    expect(listLinkSchemes([])).toEqual([]);
  });
});
