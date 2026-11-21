import { describe, expect, it } from "vitest";
import { METRO_NAMESPACES } from "../../testing/fixtures.js";
import listStatementSections from "./listStatementSections.js";
import type { PartitionField, PartitionGroup } from "./types.js";

const METRO = "https://metro.example/onto#";
const OVERVIEW = {
  uri: `${METRO}section.overview`,
  label: "Overview",
  order: 1,
};
const UNLABELLED = { uri: `${METRO}section.place`, order: 3 };

const group = (local: string): PartitionGroup => ({
  predicateUri: `${METRO}${local}`,
  values: [],
});

const field = (
  name: string,
  rest: Omit<PartitionField, "name" | "property"> = {},
): PartitionField => ({ name, property: { uri: `${METRO}${name}` }, ...rest });

describe("listStatementSections", () => {
  it("holds each property group's values in one section, in field order", () => {
    const count = group("platformCount");
    const length = group("platformLength");
    const zone = group("inZone");
    const sections = listStatementSections(
      {
        prominent: [],
        values: [
          {
            group: length,
            field: field("platformLength", { order: 3, group: OVERVIEW }),
          },
          {
            group: zone,
            field: field("inZone", { order: 2, group: UNLABELLED }),
          },
          {
            group: count,
            field: field("platformCount", { order: 2, group: OVERVIEW }),
          },
        ],
        relations: [],
      },
      METRO_NAMESPACES,
      "Properties",
    );
    expect(sections).toEqual([
      {
        kind: "values",
        id: "g-metro-section-place",
        field: "inZone",
        title: "metro:section.place",
        groups: [zone],
      },
      {
        kind: "values",
        id: "g-metro-section-overview",
        field: "platformCount",
        title: "Overview",
        groups: [count, length],
      },
    ]);
  });

  it("gathers values no group holds, and names a predicate the lens does not by its compact form", () => {
    const note = group("note");
    const stray = group("stray");
    const calls = group("calls");
    const sections = listStatementSections(
      {
        prominent: [],
        values: [
          { group: stray, field: undefined },
          { group: note, field: field("note") },
        ],
        relations: [
          { group: calls, field: field("calls", { order: 1 }) },
          { group: group("served by"), field: undefined },
        ],
      },
      METRO_NAMESPACES,
      "Properties",
    );
    expect(sections).toEqual([
      {
        kind: "values",
        id: "g-properties",
        field: "metro:stray",
        title: "Properties",
        groups: [stray, note],
      },
      { kind: "relation", id: "p-calls", field: "calls", group: calls },
      {
        kind: "relation",
        id: "p-metro-served-by",
        field: "metro:served by",
        group: expect.objectContaining({ predicateUri: `${METRO}served by` }),
      },
    ]);
  });
});
