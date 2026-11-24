import {
  createSchema,
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type Predicate,
  type PredicateOperator,
  type Slice,
} from "@canonical/dataviews-core";
import { applyQueryCommand } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import findContradictions from "./findContradictions.js";

const schema = createSchema([
  { field: "status", kind: "choices", options: ["failed", "ready", 3] },
  { field: "tags", kind: "choices", multiple: true },
  { field: "name", kind: "text" },
  { field: "cores", kind: "number" },
  { field: "created", kind: "date" },
  { field: "owner", kind: "presence" },
]);

const sliceOf = (...filter: Predicate[]): Slice => ({
  ...EMPTY_SLICE,
  filter,
});

const on = (
  field: string,
  operator: PredicateOperator,
  ...operands: Predicate["operands"]
): Predicate => ({ field, operator, operands });

const find = (...filter: Predicate[]) =>
  findContradictions(sliceOf(...filter), schema);

describe("findContradictions", () => {
  it("finds nothing in a query whose conjuncts can all hold", () => {
    expect(find()).toEqual([]);
    expect(
      find(
        on("status", "isAny", "failed", "ready"),
        on("status", "isAny", "ready"),
        on("name", "is", "alder"),
        on("cores", "gte", 4),
        on("cores", "lte", 4),
        on("owner", "isSet", true),
      ),
    ).toEqual([]);
  });

  describe("sets sharing no option", () => {
    it("contradict on a single-valued choice, and merge into their union", () => {
      expect(
        find(on("status", "isAny", "failed"), on("status", "isAny", "ready")),
      ).toEqual([
        {
          field: "status",
          kind: "disjoint-options",
          refs: [
            { field: "status", operator: "isAny", nth: 0 },
            { field: "status", operator: "isAny", nth: 1 },
          ],
          merge: {
            remove: [
              { field: "status", operator: "isAny", nth: 0 },
              { field: "status", operator: "isAny", nth: 1 },
            ],
            add: [on("status", "isAny", "failed", "ready")],
          },
        },
      ]);
    });

    it("contradict when no option is in every set, though some pairs share", () => {
      const [found] = find(
        on("status", "isAny", "failed", "ready"),
        on("status", "isAny", "ready", 3),
        on("status", "isAny", "failed", 3),
      );
      expect(found?.kind).toBe("disjoint-options");
      expect(found?.refs).toHaveLength(3);
      expect(found?.merge?.add).toEqual([
        on("status", "isAny", 3, "failed", "ready"),
      ]);
    });

    it("share an option spelled as a number in one and text in another", () => {
      expect(
        find(on("status", "isAny", 3), on("status", "isAny", "3")),
      ).toEqual([]);
    });

    it("never contradict on a list-valued choice", () => {
      expect(
        find(on("tags", "isAny", "ex-gpu"), on("tags", "isAny", "ex-nvme")),
      ).toEqual([]);
    });

    it("never contradict on a field the schema lacks", () => {
      expect(find(on("rack", "isAny", "a"), on("rack", "isAny", "b"))).toEqual(
        [],
      );
    });
  });

  describe("text asked to equal two texts", () => {
    it("contradicts, with no merge", () => {
      expect(
        find(on("name", "is", "alder"), on("name", "is", "birch")),
      ).toEqual([
        {
          field: "name",
          kind: "different-text",
          refs: [
            { field: "name", operator: "is", nth: 0 },
            { field: "name", operator: "is", nth: 1 },
          ],
          merge: null,
        },
      ]);
    });

    it("holds for two spellings of one text once folded", () => {
      expect(
        find(on("name", "is", "Alder"), on("name", "is", "alder")),
      ).toEqual([]);
    });
  });

  describe("a lower bound above an upper one", () => {
    it("contradicts, and merges by swapping a single pair", () => {
      expect(find(on("cores", "gte", 16), on("cores", "lte", 4))).toEqual([
        {
          field: "cores",
          kind: "crossed-bounds",
          refs: [
            { field: "cores", operator: "gte", nth: 0 },
            { field: "cores", operator: "lte", nth: 0 },
          ],
          merge: {
            remove: [
              { field: "cores", operator: "gte", nth: 0 },
              { field: "cores", operator: "lte", nth: 0 },
            ],
            add: [on("cores", "gte", 4), on("cores", "lte", 16)],
          },
        },
      ]);
    });

    it("contradicts over calendar dates", () => {
      expect(
        find(
          on("created", "gte", "2026-02-01"),
          on("created", "lte", "2026-01-31"),
        ).map(({ kind }) => kind),
      ).toEqual(["crossed-bounds"]);
    });

    it("names the crossing pair among several bounds, with no merge", () => {
      // Canonical order reads the bounds by their text: 12, 16, 2 and 8.
      expect(
        find(
          on("cores", "gte", 12),
          on("cores", "gte", 2),
          on("cores", "gte", 16),
          on("cores", "lte", 8),
          on("cores", "lte", 32),
        ),
      ).toEqual([
        {
          field: "cores",
          kind: "crossed-bounds",
          refs: [
            { field: "cores", operator: "gte", nth: 1 },
            { field: "cores", operator: "lte", nth: 1 },
          ],
          merge: null,
        },
      ]);
    });

    it("holds with only one side bounded", () => {
      expect(find(on("cores", "gte", 16), on("cores", "gte", 32))).toEqual([]);
      expect(find(on("cores", "lte", 16))).toEqual([]);
    });

    it("holds when the bounds cannot be ordered", () => {
      expect(find(on("cores", "gte", "16"), on("cores", "lte", 4))).toEqual([]);
    });
  });

  describe("presence asked both ways", () => {
    it("contradicts, with no merge", () => {
      expect(
        find(on("owner", "isSet", true), on("owner", "isSet", false)),
      ).toEqual([
        {
          field: "owner",
          kind: "set-and-unset",
          refs: [
            { field: "owner", operator: "isSet", nth: 0 },
            { field: "owner", operator: "isSet", nth: 1 },
          ],
          merge: null,
        },
      ]);
    });

    it("holds when asked one way only", () => {
      expect(find(on("owner", "isSet", false))).toEqual([]);
      expect(find(on("owner", "isSet", true), on("owner", "isSet"))).toEqual(
        [],
      );
    });
  });

  it("lists contradictions field by field, in canonical order", () => {
    expect(
      find(
        on("status", "isAny", "failed"),
        on("cores", "gte", 16),
        on("status", "isAny", "ready"),
        on("cores", "lte", 4),
      ).map(({ field, kind }) => `${field} ${kind}`),
    ).toEqual(["cores crossed-bounds", "status disjoint-options"]);
  });

  describe("over every slice drawn from a pool of conjuncts", () => {
    const pool: readonly Predicate[] = [
      on("status", "isAny", "failed"),
      on("status", "isAny", "ready"),
      on("status", "isAny", "failed", 3),
      on("cores", "gte", 16),
      on("cores", "lte", 4),
      on("cores", "lte", 32),
      on("name", "is", "alder"),
      on("owner", "isSet", false),
      on("owner", "isSet", true),
    ];
    const slices: Slice[] = Array.from(
      { length: 2 ** pool.length },
      (_, mask) => sliceOf(...pool.filter((_, bit) => (mask >> bit) & 1)),
    );

    it("resolves each contradiction its merge is applied to", () => {
      const merged = new Set<string>();
      for (const slice of slices) {
        for (const { field, kind, merge } of findContradictions(
          slice,
          schema,
        )) {
          if (merge === null) {
            continue;
          }
          merged.add(kind);
          const applied = applyQueryCommand(slice, DEFAULT_WINDOW, {
            kind: "editPredicates",
            ...merge,
          });
          expect(applied.status).toBe("accepted");
          expect(
            findContradictions(applied.slice, schema).filter(
              (left) => left.field === field && left.kind === kind,
            ),
          ).toEqual([]);
        }
      }
      expect([...merged].sort()).toEqual([
        "crossed-bounds",
        "disjoint-options",
      ]);
    });
  });
});
