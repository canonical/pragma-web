import {
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type Predicate,
  type QueryIssue,
  type Slice,
} from "@canonical/dataviews-core";
import {
  applyQueryCommand,
  canonicalizeSlice,
} from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import readClauses from "./readClauses.js";
import type { QueryClause, QueryStateStandIn } from "./types.js";

const stateOf = (
  slice: Partial<Slice>,
  refused: readonly QueryIssue[] = [],
): QueryStateStandIn => ({
  slice: { ...EMPTY_SLICE, ...slice },
  window: DEFAULT_WINDOW,
  view: null,
  refused,
});

const tags = (...operands: string[]): Predicate => ({
  field: "tags",
  operator: "isAny",
  operands,
});
const cores = (operator: "gte" | "lte", bound: number): Predicate => ({
  field: "cores",
  operator,
  operands: [bound],
});

const refusal = (parameter: string): QueryIssue => ({
  parameter,
  field: parameter === "q" ? null : parameter,
  code: "invalid",
  reason: "not an option",
});

/** Every predicate a clause list stands for, in its order. */
const listPredicates = (clauses: readonly QueryClause[]): Predicate[] =>
  clauses.flatMap((clause) => {
    switch (clause.kind) {
      case "predicate":
        return [clause.predicate];
      case "range":
        return [clause.lower, clause.upper];
      default:
        return [];
    }
  });

const idsOf = (filter: readonly Predicate[]): string[] =>
  readClauses(stateOf({ filter })).map((clause) => clause.id);

describe("readClauses", () => {
  it("reads nothing from an empty query", () => {
    expect(readClauses(stateOf({}))).toEqual([]);
  });

  it("reads each conjunct as a clause, numbered at its address", () => {
    expect(
      readClauses(
        stateOf({
          filter: [
            tags("ex-nvme"),
            { field: "owner", operator: "isSet", operands: [false] },
            tags("ex-gpu"),
          ],
        }),
      ),
    ).toEqual([
      {
        kind: "predicate",
        id: "owner__isSet__0",
        refs: [{ field: "owner", operator: "isSet", nth: 0 }],
        predicate: { field: "owner", operator: "isSet", operands: [false] },
        condition: "exclusion",
      },
      {
        kind: "predicate",
        id: "tags__isAny__0",
        refs: [{ field: "tags", operator: "isAny", nth: 0 }],
        predicate: tags("ex-gpu"),
        condition: "inclusion",
      },
      {
        kind: "predicate",
        id: "tags__isAny__1",
        refs: [{ field: "tags", operator: "isAny", nth: 1 }],
        predicate: tags("ex-nvme"),
        condition: "inclusion",
      },
    ]);
  });

  it("reads a conjunct spelled twice, or its set reordered, as one", () => {
    expect(
      readClauses(
        stateOf({ filter: [tags("b", "a"), tags("a", "b", "a")] }),
      ).map((clause) => clause.id),
    ).toEqual(["tags__isAny__0"]);
  });

  it("reads the search after the filter, and no empty search", () => {
    expect(
      readClauses(stateOf({ filter: [tags("a")], search: "alder" })).at(-1),
    ).toEqual({ kind: "search", id: "search", refs: [], search: "alder" });
    expect(readClauses(stateOf({ search: "" }))).toEqual([]);
  });

  it("reads each refused parameter last, numbering a repeat", () => {
    const status = refusal("status");
    const query = refusal("q");
    expect(
      readClauses(stateOf({ search: "alder" }, [status, query, status])),
    ).toEqual([
      { kind: "search", id: "search", refs: [], search: "alder" },
      { kind: "refused", id: "refused__status", refs: [], issue: status },
      { kind: "refused", id: "refused__q", refs: [], issue: query },
      { kind: "refused", id: "refused__status__1", refs: [], issue: status },
    ]);
  });

  describe("a field's two bounds", () => {
    it("read as one range where its lower bound stood", () => {
      expect(
        readClauses(
          stateOf({ filter: [cores("lte", 32), tags("a"), cores("gte", 4)] }),
        ),
      ).toEqual([
        {
          kind: "range",
          id: "cores__range",
          field: "cores",
          refs: [
            { field: "cores", operator: "gte", nth: 0 },
            { field: "cores", operator: "lte", nth: 0 },
          ],
          lower: cores("gte", 4),
          upper: cores("lte", 32),
          condition: "range",
        },
        expect.objectContaining({ id: "tags__isAny__0" }),
      ]);
    });

    it("read as one range at equal bounds, and over calendar dates", () => {
      expect(idsOf([cores("gte", 8), cores("lte", 8)])).toEqual([
        "cores__range",
      ]);
      expect(
        idsOf([
          { field: "created", operator: "gte", operands: ["2026-01-31"] },
          { field: "created", operator: "lte", operands: ["2026-02-01"] },
        ]),
      ).toEqual(["created__range"]);
    });

    it("stay apart when the lower stands above the upper", () => {
      expect(idsOf([cores("gte", 16), cores("lte", 8)])).toEqual([
        "cores__gte__0",
        "cores__lte__0",
      ]);
      expect(
        idsOf([
          { field: "created", operator: "gte", operands: ["2026-02-01"] },
          { field: "created", operator: "lte", operands: ["2026-01-31"] },
        ]),
      ).toEqual(["created__gte__0", "created__lte__0"]);
    });

    it("stay apart beside a further bound, or with only one", () => {
      expect(
        idsOf([cores("gte", 2), cores("gte", 4), cores("lte", 8)]),
      ).toEqual(["cores__gte__0", "cores__gte__1", "cores__lte__0"]);
      expect(
        idsOf([cores("gte", 2), cores("lte", 4), cores("lte", 8)]),
      ).toEqual(["cores__gte__0", "cores__lte__0", "cores__lte__1"]);
      expect(idsOf([cores("lte", 8)])).toEqual(["cores__lte__0"]);
    });

    it("stay apart when they cannot be ordered", () => {
      expect(
        idsOf([
          cores("gte", 2),
          { field: "cores", operator: "lte", operands: ["8"] },
        ]),
      ).toEqual(["cores__gte__0", "cores__lte__0"]);
    });

    it("leave any other conjunct on the field standing beside the range", () => {
      expect(
        idsOf([
          cores("gte", 2),
          { field: "cores", operator: "isSet", operands: [true] },
          cores("lte", 8),
        ]),
      ).toEqual(["cores__range", "cores__isSet__0"]);
    });

    it("read as a range on each field holding one", () => {
      expect(
        idsOf([
          cores("gte", 2),
          cores("lte", 8),
          { field: "memory", operator: "gte", operands: [1024] },
          { field: "memory", operator: "lte", operands: [512] },
        ]),
      ).toEqual(["cores__range", "memory__gte__0", "memory__lte__0"]);
    });
  });

  describe("over every slice drawn from a pool of conjuncts", () => {
    const pool: readonly Predicate[] = [
      tags("a"),
      tags("b"),
      tags("a", "b"),
      cores("gte", 4),
      cores("gte", 16),
      cores("lte", 8),
      cores("lte", 2),
      { field: "name", operator: "contains", operands: ["ex"] },
      { field: "owner", operator: "isSet", operands: [true] },
    ];
    const slices: Slice[] = Array.from(
      { length: 2 ** pool.length },
      (_, mask) => ({
        ...EMPTY_SLICE,
        filter: pool.filter((_, bit) => (mask >> bit) & 1),
      }),
    );

    it("names every conjunct exactly once across its clauses", () => {
      for (const slice of slices) {
        const refs = readClauses(stateOf(slice)).flatMap(
          (clause) => clause.refs,
        );
        const removed = applyQueryCommand(slice, DEFAULT_WINDOW, {
          kind: "editPredicates",
          remove: refs,
          add: [],
        });
        // A ref named twice, or naming none, is rejected; one left out
        // leaves its conjunct standing.
        expect(removed.status).toBe("accepted");
        expect(removed.slice.filter).toEqual([]);
      }
    });

    it("regroups into the canonical filter and no more", () => {
      for (const slice of slices) {
        expect(listPredicates(readClauses(stateOf(slice)))).toEqual(
          canonicalizeSlice(slice).filter,
        );
      }
    });

    it("gives every clause its own id", () => {
      for (const slice of slices) {
        const ids = readClauses(stateOf(slice)).map((clause) => clause.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });
  });
});
