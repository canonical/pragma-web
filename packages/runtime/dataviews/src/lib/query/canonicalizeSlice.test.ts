import { describe, expect, it } from "vitest";
import canonicalizeSlice from "./canonicalizeSlice.js";
import type { Slice } from "./types.js";

const buildSlice = (overrides: Partial<Slice> = {}): Slice => ({
  filter: [],
  search: null,
  sort: [],
  group: [],
  ...overrides,
});

describe("canonicalizeSlice", () => {
  it("is idempotent", () => {
    const input = buildSlice({
      filter: [
        {
          field: "status",
          operator: "isAny",
          operands: ["failed", "cancelled"],
        },
      ],
      sort: [
        { field: "updated", direction: "desc" },
        { field: "name", direction: "asc" },
      ],
      group: [{ field: "zone" }, { field: "status" }],
    });
    const once = canonicalizeSlice(input);
    expect(canonicalizeSlice(once)).toEqual(once);
  });

  it("treats set operands as a set regardless of order", () => {
    const left = canonicalizeSlice(
      buildSlice({
        filter: [
          {
            field: "status",
            operator: "isAny",
            operands: ["failed", "cancelled"],
          },
        ],
      }),
    );
    const right = canonicalizeSlice(
      buildSlice({
        filter: [
          {
            field: "status",
            operator: "isAny",
            operands: ["cancelled", "failed"],
          },
        ],
      }),
    );
    expect(left).toEqual(right);
  });

  it("deduplicates repeated set operands", () => {
    const result = canonicalizeSlice(
      buildSlice({
        filter: [
          {
            field: "status",
            operator: "isAny",
            operands: ["failed", "failed"],
          },
        ],
      }),
    );
    expect(result.filter.at(0)?.operands).toEqual(["failed"]);
  });

  it("keeps grouping levels in their nesting order", () => {
    const input = buildSlice({
      group: [{ field: "zone" }, { field: "status" }],
    });
    expect(canonicalizeSlice(input).group).toEqual([
      { field: "zone" },
      { field: "status" },
    ]);
    // Rebuilt, so a caller's later mutation cannot reach the canonical form.
    expect(canonicalizeSlice(input).group.at(0)).not.toBe(input.group.at(0));
  });

  it("keeps an ungrouped slice ungrouped", () => {
    expect(canonicalizeSlice(buildSlice()).group).toEqual([]);
  });

  it("keeps repeated grouping levels, which nest rather than collapse", () => {
    const input = buildSlice({ group: [{ field: "zone" }, { field: "zone" }] });
    expect(canonicalizeSlice(input).group).toHaveLength(2);
  });

  it("keeps sort term order untouched", () => {
    const input = buildSlice({
      sort: [
        { field: "updated", direction: "desc" },
        { field: "status", direction: "asc" },
      ],
    });
    expect(canonicalizeSlice(input).sort).toEqual(input.sort);
  });

  it("collapses a sort field spelled twice to its first term, in place", () => {
    const result = canonicalizeSlice(
      buildSlice({
        sort: [
          { field: "updated", direction: "desc" },
          { field: "status", direction: "asc" },
          { field: "updated", direction: "asc" },
        ],
      }),
    );
    expect(result.sort).toEqual([
      { field: "updated", direction: "desc" },
      { field: "status", direction: "asc" },
    ]);
  });

  it("keeps every conjunct an address holds, ordered by their operands", () => {
    const result = canonicalizeSlice(
      buildSlice({
        filter: [
          { field: "status", operator: "isAny", operands: ["failed"] },
          { field: "status", operator: "isAny", operands: ["cancelled"] },
        ],
      }),
    );
    // Both restrict: a duplicate address is an AND, never the last one.
    expect(result.filter).toEqual([
      { field: "status", operator: "isAny", operands: ["cancelled"] },
      { field: "status", operator: "isAny", operands: ["failed"] },
    ]);
  });

  it("collapses only identical conjuncts, as A and A is A", () => {
    const result = canonicalizeSlice(
      buildSlice({
        filter: [
          { field: "tags", operator: "isAny", operands: ["b", "a"] },
          { field: "cpu", operator: "gte", operands: [4] },
          { field: "tags", operator: "isAny", operands: ["a", "b", "a"] },
          { field: "cpu", operator: "gte", operands: [4] },
          { field: "cpu", operator: "gte", operands: [8] },
        ],
      }),
    );
    expect(result.filter).toEqual([
      { field: "cpu", operator: "gte", operands: [4] },
      { field: "cpu", operator: "gte", operands: [8] },
      { field: "tags", operator: "isAny", operands: ["a", "b"] },
    ]);
  });

  it("orders conjuncts the same way whatever order they are given in", () => {
    const conjuncts = [
      { field: "tags", operator: "isAny", operands: ["ex-nvme"] },
      { field: "tags", operator: "isAny", operands: ["ex-gpu", "ex-ssd"] },
      { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
    ] as const;
    const once = canonicalizeSlice(buildSlice({ filter: conjuncts }));
    expect(
      canonicalizeSlice(buildSlice({ filter: [...conjuncts].reverse() })),
    ).toEqual(once);
    expect(canonicalizeSlice(once)).toEqual(once);
  });

  it("orders predicates by field then operator", () => {
    const result = canonicalizeSlice(
      buildSlice({
        filter: [
          { field: "zone", operator: "isAny", operands: ["north"] },
          { field: "status", operator: "isAny", operands: ["failed"] },
          { field: "status", operator: "isSet", operands: [] },
        ],
      }),
    );
    expect(result.filter.map((predicate) => predicate.field)).toEqual([
      "status",
      "status",
      "zone",
    ]);
    expect(result.filter.map((predicate) => predicate.operator)).toEqual([
      "isAny",
      "isSet",
      "isAny",
    ]);
  });

  it("treats an empty search as no search", () => {
    expect(canonicalizeSlice(buildSlice({ search: "" })).search).toBeNull();
    expect(canonicalizeSlice(buildSlice({ search: "yak" })).search).toBe("yak");
  });

  it("orders set operands identically regardless of input order", () => {
    // Distinct strings that locale collation may tie (é NFC vs e + combining
    // acute) must still canonicalize to one deterministic order.
    const left = canonicalizeSlice(
      buildSlice({
        filter: [
          {
            field: "owner",
            operator: "isAny",
            operands: ["e\u0301", "é", "ed"],
          },
        ],
      }),
    );
    const right = canonicalizeSlice(
      buildSlice({
        filter: [
          {
            field: "owner",
            operator: "isAny",
            operands: ["ed", "é", "e\u0301"],
          },
        ],
      }),
    );
    expect(left).toEqual(right);
  });

  it("keeps mixed-type operands distinct with a stable cross-type order", () => {
    const result = canonicalizeSlice(
      buildSlice({
        filter: [
          {
            field: "value",
            operator: "isAny",
            operands: [1, "1", null, "null", true, "true"],
          },
        ],
      }),
    );
    // The typeof tag keeps every operand distinct; nothing is deduped away.
    expect(result.filter.at(0)?.operands).toHaveLength(6);
    // Canonical order is total regardless of input order.
    const reordered = canonicalizeSlice(
      buildSlice({
        filter: [
          {
            field: "value",
            operator: "isAny",
            operands: ["true", true, "null", null, "1", 1],
          },
        ],
      }),
    );
    expect(reordered).toEqual(result);
  });

  it("keeps bound and zero-value operand shapes, ordered by address", () => {
    const input = buildSlice({
      filter: [
        { field: "updated", operator: "gte", operands: ["2026-01-01"] },
        { field: "owner", operator: "isSet", operands: [] },
      ],
    });
    expect(canonicalizeSlice(input).filter).toEqual([
      { field: "owner", operator: "isSet", operands: [] },
      { field: "updated", operator: "gte", operands: ["2026-01-01"] },
    ]);
  });
});
