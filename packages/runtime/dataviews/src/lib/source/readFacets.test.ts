import { describe, expect, it } from "vitest";
import countExactly from "../../../testing/countExactly.js";
import { FACETED_ROWS, FACETED_SCHEMA } from "../../../testing/fixtures.js";
import { EMPTY_SLICE, type Slice } from "../query/index.js";
import { createSchema, type SchemaFieldDefinition } from "../schema/index.js";
import readFacets from "./readFacets.js";
import selectRows from "./selectRows.js";

/** The definitions of the named fields, as a source resolves a request's facets. */
const findDefinitions = (
  ...fields: readonly string[]
): readonly SchemaFieldDefinition[] =>
  fields.map((field) => {
    const definition = FACETED_SCHEMA.findField(field);
    if (definition === undefined) {
      throw new Error(`no field ${field}`);
    }
    return definition;
  });

const readFacetsOver = (slice: Slice, ...fields: readonly string[]) =>
  readFacets(
    FACETED_ROWS,
    slice,
    findDefinitions(...fields),
    { schema: FACETED_SCHEMA, searchFields: ["name"] },
    selectRows(
      FACETED_ROWS,
      slice,
      { schema: FACETED_SCHEMA, searchFields: ["name"] },
      null,
    ),
  );

describe("readFacets", () => {
  it("counts each choice value in the field's order, declared options first", () => {
    expect(readFacetsOver(EMPTY_SLICE, "status")).toEqual({
      status: {
        kind: "values",
        // An option no record holds is not listed; values the options do
        // not list follow them, by code unit; a value that is no choice is
        // not counted.
        values: [
          { value: "running", count: countExactly(1) },
          { value: "failed", count: countExactly(2) },
          { value: "archived", count: countExactly(1) },
          { value: "unlisted", count: countExactly(1) },
        ],
      },
    });
  });

  it("counts a list-valued field's records once under each option they list", () => {
    const schema = createSchema([
      {
        field: "tags",
        kind: "choices",
        options: ["ex-gpu", "ex-nvme"],
        multiple: true,
      },
      { field: "labels", kind: "choices", multiple: true },
    ]);
    const rows = [
      { id: "a", tags: ["ex-nvme", "ex-gpu", "ex-gpu"], labels: [42, "42"] },
      { id: "b", tags: ["ex-nvme", null], labels: "x" },
      { id: "c" },
    ];
    expect(
      readFacets(rows, EMPTY_SLICE, schema.fields, { schema }, rows),
    ).toEqual({
      tags: {
        kind: "values",
        values: [
          { value: "ex-gpu", count: countExactly(1) },
          { value: "ex-nvme", count: countExactly(2) },
        ],
      },
      labels: {
        kind: "values",
        values: [{ value: "42", count: countExactly(1) }],
      },
    });
  });

  it("counts a presence field's set records as one value, and none when none is set", () => {
    // Set as isSet reads it: false is a value, null and absent are not.
    expect(readFacetsOver(EMPTY_SLICE, "owner")).toEqual({
      owner: {
        kind: "values",
        values: [{ value: true, count: countExactly(2) }],
      },
    });
    expect(
      readFacetsOver(
        {
          ...EMPTY_SLICE,
          filter: [
            { field: "status", operator: "isAny", operands: ["failed"] },
          ],
        },
        "owner",
      ),
    ).toEqual({ owner: { kind: "values", values: [] } });
  });

  it("bounds a number by the finite numbers the records hold", () => {
    expect(readFacetsOver(EMPTY_SLICE, "cpu")).toEqual({
      cpu: { kind: "range", min: 4, max: 32 },
    });
    expect(
      readFacetsOver({ ...EMPTY_SLICE, search: "no such name" }, "cpu"),
    ).toEqual({ cpu: { kind: "range", min: null, max: null } });
  });

  it("bounds a date by the text the records hold, as a date bound compares it", () => {
    expect(readFacetsOver(EMPTY_SLICE, "updated")).toEqual({
      updated: {
        kind: "range",
        // A Date and epoch milliseconds are no text a bound can reach, so
        // neither is offered.
        min: "2025-12-31",
        max: "2026-01-02",
      },
    });
  });

  it("lifts a field's own predicates, and keeps every other restriction", () => {
    const restricted: Slice = {
      ...EMPTY_SLICE,
      filter: [
        { field: "status", operator: "isAny", operands: ["failed"] },
        { field: "cpu", operator: "gte", operands: [8] },
      ],
    };
    expect(readFacetsOver(restricted, "status", "cpu")).toEqual({
      // Over at least eight cores, whatever the status.
      status: {
        kind: "values",
        values: [
          { value: "failed", count: countExactly(2) },
          { value: "unlisted", count: countExactly(1) },
        ],
      },
      // Over failed machines, whatever their cores.
      cpu: { kind: "range", min: 8, max: 16 },
    });
  });

  it("lifts every conjunct of a field's own, however many it holds", () => {
    const restricted: Slice = {
      ...EMPTY_SLICE,
      filter: [
        { field: "cpu", operator: "gte", operands: [4] },
        { field: "cpu", operator: "gte", operands: [16] },
        { field: "status", operator: "isAny", operands: ["failed"] },
      ],
    };
    // Both bounds are lifted from the cores' facet: over failed machines.
    expect(readFacetsOver(restricted, "cpu")).toEqual({
      cpu: { kind: "range", min: 8, max: 16 },
    });
  });

  it("computes over the records the search selects", () => {
    expect(readFacetsOver({ ...EMPTY_SLICE, search: "TA" }, "status")).toEqual({
      status: {
        kind: "values",
        values: [
          { value: "failed", count: countExactly(1) },
          { value: "unlisted", count: countExactly(1) },
        ],
      },
    });
  });

  it("refuses a text field, which has no facet", () => {
    expect(() => readFacetsOver(EMPTY_SLICE, "name")).toThrow(
      'text field "name" has no facet',
    );
  });
});
