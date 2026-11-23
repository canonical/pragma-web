import { describe, expect, it } from "vitest";
import { declare, declareSort } from "../../../testing/index.js";
import {
  DEFAULT_WINDOW,
  type Query,
  type ResultWindow,
  type Slice,
} from "../query/index.js";
import listQueryRefusals from "./listQueryRefusals.js";
import type { SourceCapabilities } from "./types.js";

const emptySlice: Slice = { filter: [], search: null, sort: [], group: [] };

const buildQuery = (
  slice: Partial<Slice> = {},
  window: Partial<ResultWindow> = {},
): Query => ({
  slice: { ...emptySlice, ...slice },
  window: { ...DEFAULT_WINDOW, ...window },
});

/** A source that can execute the whole fixture query. */
const permissive: SourceCapabilities = declare({
  filter: { status: ["isAny"], cpu: ["gte", "lte"] },
  search: { fields: ["name"] },
  sort: declareSort(["cpu"], 2),
  group: { fields: ["status"], levels: 2, summaries: "counts", collapse: true },
});

describe("listQueryRefusals", () => {
  it("refuses nothing when every term is declared", () => {
    expect(
      listQueryRefusals(
        permissive,
        buildQuery(
          {
            filter: [
              { field: "status", operator: "isAny", operands: ["failed"] },
            ],
            search: "web",
            sort: [{ field: "cpu", direction: "asc" }],
            group: [{ field: "status" }],
          },
          { collapsed: [["failed"]] },
        ),
      ),
    ).toEqual([]);
  });

  it("refuses an address once, however many conjuncts it holds", () => {
    expect(
      listQueryRefusals(
        permissive,
        buildQuery({
          filter: [
            { field: "status", operator: "isNone", operands: ["failed"] },
            { field: "status", operator: "isNone", operands: ["ready"] },
            { field: "zone", operator: "isAny", operands: ["north"] },
            { field: "zone", operator: "isAny", operands: ["south"] },
          ],
        }),
      ).map((refusal) => [refusal.code, refusal.field, refusal.operator]),
    ).toEqual([
      ["undeclared-operator", "status", "isNone"],
      ["undeclared-field", "zone", "isAny"],
    ]);
  });

  it("freezes the refusals it collects", () => {
    expect(Object.isFrozen(listQueryRefusals(permissive, buildQuery()))).toBe(
      true,
    );
  });

  it("refuses a filter on a field it does not declare", () => {
    expect(
      listQueryRefusals(
        permissive,
        buildQuery({
          filter: [{ field: "zone", operator: "isAny", operands: ["eu-west"] }],
        }),
      ),
    ).toEqual([
      {
        part: "filter",
        code: "undeclared-field",
        field: "zone",
        operator: "isAny",
        reason: 'field "zone" cannot be filtered',
      },
    ]);
  });

  it("refuses an operator it does not declare for a field it does", () => {
    expect(
      listQueryRefusals(
        permissive,
        buildQuery({
          filter: [{ field: "status", operator: "isSet", operands: [] }],
        }),
      ),
    ).toEqual([
      {
        part: "filter",
        code: "undeclared-operator",
        field: "status",
        operator: "isSet",
        reason: 'field "status" cannot be filtered with isSet',
      },
    ]);
  });

  it("reads a field declared with no operator as unfilterable", () => {
    const refusals = listQueryRefusals(
      declare({ filter: { cpu: [] } }),
      buildQuery({
        filter: [{ field: "cpu", operator: "gte", operands: [1] }],
      }),
    );
    expect(refusals).toMatchObject([
      { code: "undeclared-field", field: "cpu" },
    ]);
  });

  it("refuses a search on a source that declares none", () => {
    expect(
      listQueryRefusals(declare({}), buildQuery({ search: "web" })),
    ).toEqual([
      {
        part: "search",
        code: "undeclared-field",
        field: null,
        operator: null,
        reason: "this source cannot search",
      },
    ]);
  });

  it("refuses any ordering on a source declaring no sort terms", () => {
    expect(
      listQueryRefusals(
        declare({}),
        buildQuery({ sort: [{ field: "cpu", direction: "asc" }] }),
      ),
    ).toEqual([
      {
        part: "sort",
        code: "too-many-terms",
        field: null,
        operator: null,
        reason: "this source cannot sort",
      },
    ]);
  });

  it("refuses an over-long ordering whole rather than truncating it", () => {
    expect(
      listQueryRefusals(
        declare({ sort: declareSort(["cpu", "name"], 1) }),
        buildQuery({
          sort: [
            { field: "cpu", direction: "asc" },
            { field: "name", direction: "desc" },
          ],
        }),
      ),
    ).toEqual([
      {
        part: "sort",
        code: "too-many-terms",
        field: null,
        operator: null,
        reason: "this source orders by at most 1 term",
      },
    ]);
  });

  it("reports an unsortable field beside the term limit, not instead of it", () => {
    expect(
      listQueryRefusals(
        declare({ sort: declareSort(["cpu"], 1) }),
        buildQuery({
          sort: [
            { field: "cpu", direction: "asc" },
            { field: "zone", direction: "desc" },
          ],
        }),
      ).map((refusal) => [refusal.code, refusal.field]),
    ).toEqual([
      ["too-many-terms", null],
      ["undeclared-field", "zone"],
    ]);
  });

  it("counts a field spelled twice once against the term limit", () => {
    expect(
      listQueryRefusals(
        declare({ sort: declareSort(["cpu"], 1) }),
        buildQuery({
          sort: [
            { field: "cpu", direction: "asc" },
            { field: "cpu", direction: "desc" },
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("counts the term limit in the plural above one", () => {
    expect(
      listQueryRefusals(
        declare({
          sort: declareSort(["cpu", "name", "zone"], 2),
        }),
        buildQuery({
          sort: [
            { field: "cpu", direction: "asc" },
            { field: "name", direction: "desc" },
            { field: "zone", direction: "asc" },
          ],
        }),
      ),
    ).toMatchObject([{ reason: "this source orders by at most 2 terms" }]);
  });

  it("refuses an ordering term on a field it cannot sort", () => {
    expect(
      listQueryRefusals(
        declare({ sort: declareSort(["cpu"]) }),
        buildQuery({ sort: [{ field: "zone", direction: "asc" }] }),
      ),
    ).toEqual([
      {
        part: "sort",
        code: "undeclared-field",
        field: "zone",
        operator: null,
        reason: 'field "zone" cannot be sorted',
      },
    ]);
  });

  it("refuses any grouping on a source declaring no levels", () => {
    expect(
      listQueryRefusals(
        declare({}),
        buildQuery({ group: [{ field: "status" }] }),
      ),
    ).toEqual([
      {
        part: "group",
        code: "too-many-levels",
        field: null,
        operator: null,
        reason: "this source cannot group",
      },
    ]);
  });

  it("refuses a grouping nested deeper than it declares", () => {
    const shallow = declare({
      group: {
        fields: ["status", "zone"],
        levels: 1,
        summaries: "none",
        collapse: false,
      },
    });
    // Exactly as deep as declared is within the declaration.
    expect(
      listQueryRefusals(
        shallow,
        buildQuery({ group: [{ field: "status" }] }),
      ).filter((refusal) => refusal.part === "group"),
    ).toEqual([]);
    expect(
      listQueryRefusals(
        shallow,
        buildQuery({ group: [{ field: "status" }, { field: "zone" }] }),
      ),
    ).toEqual([
      {
        part: "group",
        code: "too-many-levels",
        field: null,
        operator: null,
        reason: "this source groups by at most 1 level",
      },
    ]);
  });

  it("counts the grouping levels in the plural above one", () => {
    const deeper = declare({
      group: {
        fields: ["status"],
        levels: 2,
        summaries: "none",
        collapse: false,
      },
    });
    expect(
      listQueryRefusals(
        deeper,
        buildQuery({
          group: [
            { field: "status" },
            { field: "status" },
            { field: "status" },
          ],
        }),
      ),
    ).toMatchObject([{ reason: "this source groups by at most 2 levels" }]);
  });

  it("refuses a grouping level on a field it cannot group", () => {
    expect(
      listQueryRefusals(permissive, buildQuery({ group: [{ field: "zone" }] })),
    ).toEqual([
      {
        part: "group",
        code: "undeclared-field",
        field: "zone",
        operator: null,
        reason: 'field "zone" cannot be grouped',
      },
    ]);
  });

  it("refuses a collapsed group on a source that cannot leave rows out", () => {
    expect(
      listQueryRefusals(
        declare({}),
        buildQuery({}, { collapsed: [["failed"]] }),
      ),
    ).toEqual([
      {
        part: "window",
        code: "unsupported-collapse",
        field: null,
        operator: null,
        reason: "this source cannot leave collapsed groups out of a page",
      },
    ]);
  });

  it("refuses a cursor on a source that pages by number", () => {
    expect(
      listQueryRefusals(declare({}), buildQuery({}, { cursor: "c1" })),
    ).toEqual([
      {
        part: "window",
        code: "unreachable-page",
        field: null,
        operator: null,
        reason: "this source pages by number and reaches no page by token",
      },
    ]);
  });

  it("leaves a cursor alone on a source that pages by token", () => {
    expect(
      listQueryRefusals(
        declare({
          pagination: { kind: "cursor", backward: false, durable: true },
        }),
        buildQuery({}, { cursor: "c1" }),
      ),
    ).toEqual([]);
  });

  it("collects every refusal at once rather than the first", () => {
    expect(
      listQueryRefusals(
        declare({}),
        buildQuery(
          {
            filter: [{ field: "zone", operator: "isAny", operands: ["eu"] }],
            search: "web",
            sort: [{ field: "cpu", direction: "asc" }],
            group: [{ field: "status" }],
          },
          { cursor: "c1", collapsed: [["failed"]] },
        ),
      ).map((refusal) => refusal.part),
    ).toEqual(["filter", "search", "sort", "group", "window", "window"]);
  });

  it("canonicalizes first, so one query always refuses the same way", () => {
    const respelled = listQueryRefusals(
      permissive,
      buildQuery({
        filter: [
          { field: "zone", operator: "isAny", operands: ["b", "a"] },
          { field: "zone", operator: "isAny", operands: ["a", "b"] },
        ],
      }),
    );
    expect(respelled).toHaveLength(1);
    expect(respelled.at(0)).toMatchObject({ field: "zone" });
  });
});
