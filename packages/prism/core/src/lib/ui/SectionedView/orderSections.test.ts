import { describe, expect, it } from "vitest";
import orderSections from "./orderSections.js";

/** Sections named by their anchor field, in the page's input order. */
const SECTIONS = [
  { field: "anatomyDsl", id: "anatomy" },
  { field: "properties", id: "properties" },
  { field: "inheritsFroms", id: "relations" },
] as const;

/** Read the ids of ordered sections. */
const ids = (sections: readonly { readonly id: string }[]): string[] =>
  sections.map(({ id }) => id);

describe("orderSections", () => {
  it("orders by the group's order, then by the field's own", () => {
    expect(
      ids(
        orderSections(SECTIONS, [
          { name: "anatomyDsl", order: 1, group: { order: 2 } },
          { name: "properties", order: 2, group: { order: 1 } },
          { name: "inheritsFroms", order: 1, group: { order: 1 } },
        ]),
      ),
    ).toEqual(["relations", "properties", "anatomy"]);
  });

  it("keeps the input order between fields the lens ranks equally", () => {
    expect(
      ids(
        orderSections(SECTIONS, [
          { name: "anatomyDsl", order: null, group: { order: 1 } },
          { name: "properties", order: null, group: { order: 1 } },
          { name: "inheritsFroms", order: null, group: { order: 1 } },
        ]),
      ),
    ).toEqual(["anatomy", "properties", "relations"]);
  });

  it("puts an ungrouped field after the grouped ones", () => {
    expect(
      ids(
        orderSections(SECTIONS, [
          { name: "anatomyDsl", order: 1, group: null },
          { name: "properties", order: 5, group: { order: 3 } },
          { name: "inheritsFroms", order: 2, group: null },
        ]),
      ),
    ).toEqual(["properties", "anatomy", "relations"]);
  });

  it("keeps a field the lens does not place in its input position after the placed ones", () => {
    expect(
      ids(
        orderSections(SECTIONS, [
          { name: "anatomyDsl", order: null, group: null },
          { name: "inheritsFroms", order: 1, group: { order: 1 } },
        ]),
      ),
    ).toEqual(["relations", "anatomy", "properties"]);
  });

  it("returns the input order when the lens places nothing", () => {
    expect(ids(orderSections(SECTIONS, []))).toEqual([
      "anatomy",
      "properties",
      "relations",
    ]);
  });
});
