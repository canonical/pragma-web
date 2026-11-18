import { describe, expect, it } from "vitest";
import applyQueryCommand from "./applyQueryCommand.js";
import areSlicesEqual from "./areSlicesEqual.js";
import { DEFAULT_WINDOW } from "./constants.js";
import type { Slice } from "./types.js";

const buildSlice = (overrides: Partial<Slice> = {}): Slice => ({
  filter: [],
  search: null,
  sort: [],
  group: [],
  ...overrides,
});

describe("areSlicesEqual", () => {
  it("is true when an ordering repeats a field it already orders by", () => {
    expect(
      areSlicesEqual(
        buildSlice({
          sort: [
            { field: "cpu", direction: "asc" },
            { field: "cpu", direction: "desc" },
          ],
        }),
        buildSlice({ sort: [{ field: "cpu", direction: "asc" }] }),
      ),
    ).toBe(true);
  });

  it("is true for identical slices", () => {
    const value = buildSlice({ search: "yak" });
    expect(areSlicesEqual(value, buildSlice({ search: "yak" }))).toBe(true);
  });

  it("is true when only set operand order differs", () => {
    const left = buildSlice({
      filter: [
        {
          field: "status",
          operator: "isAny",
          operands: ["failed", "cancelled"],
        },
      ],
    });
    const right = buildSlice({
      filter: [
        {
          field: "status",
          operator: "isAny",
          operands: ["cancelled", "failed"],
        },
      ],
    });
    expect(areSlicesEqual(left, right)).toBe(true);
  });

  it("is true when only predicate list order differs", () => {
    const left = buildSlice({
      filter: [
        { field: "status", operator: "isAny", operands: ["failed"] },
        { field: "zone", operator: "isAny", operands: ["north"] },
      ],
    });
    const right = buildSlice({
      filter: [
        { field: "zone", operator: "isAny", operands: ["north"] },
        { field: "status", operator: "isAny", operands: ["failed"] },
      ],
    });
    expect(areSlicesEqual(left, right)).toBe(true);
  });

  it("is false when sort order differs", () => {
    const left = buildSlice({
      sort: [
        { field: "status", direction: "asc" },
        { field: "updated", direction: "desc" },
      ],
    });
    const right = buildSlice({
      sort: [
        { field: "updated", direction: "desc" },
        { field: "status", direction: "asc" },
      ],
    });
    expect(areSlicesEqual(left, right)).toBe(false);
  });

  it("is false when sort direction differs", () => {
    const left = buildSlice({ sort: [{ field: "name", direction: "asc" }] });
    const right = buildSlice({ sort: [{ field: "name", direction: "desc" }] });
    expect(areSlicesEqual(left, right)).toBe(false);
  });

  it("is false when the sort has a term the other does not", () => {
    const left = buildSlice({ sort: [{ field: "name", direction: "asc" }] });
    expect(areSlicesEqual(left, buildSlice())).toBe(false);
  });

  it("is false when an operand differs", () => {
    const left = buildSlice({
      filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
    });
    const right = buildSlice({
      filter: [{ field: "status", operator: "isAny", operands: ["cancelled"] }],
    });
    expect(areSlicesEqual(left, right)).toBe(false);
  });

  it("is false when a predicate's field, operator or arity differs", () => {
    const anyOf = buildSlice({
      filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
    });
    expect(
      areSlicesEqual(
        anyOf,
        buildSlice({
          filter: [{ field: "zone", operator: "isAny", operands: ["failed"] }],
        }),
      ),
    ).toBe(false);
    expect(
      areSlicesEqual(
        anyOf,
        buildSlice({
          filter: [{ field: "status", operator: "isSet", operands: [] }],
        }),
      ),
    ).toBe(false);
    expect(
      areSlicesEqual(
        anyOf,
        buildSlice({
          filter: [
            {
              field: "status",
              operator: "isAny",
              operands: ["failed", "ready"],
            },
          ],
        }),
      ),
    ).toBe(false);
    expect(areSlicesEqual(anyOf, buildSlice())).toBe(false);
  });

  it("is false when the search differs", () => {
    expect(areSlicesEqual(buildSlice({ search: "yak" }), buildSlice())).toBe(
      false,
    );
  });

  it("compares grouping levels in order, not as a set", () => {
    const nested = buildSlice({
      group: [{ field: "zone" }, { field: "status" }],
    });
    expect(
      areSlicesEqual(
        nested,
        buildSlice({ group: [{ field: "zone" }, { field: "status" }] }),
      ),
    ).toBe(true);
    // The outer level decides what the inner one nests inside.
    expect(
      areSlicesEqual(
        nested,
        buildSlice({ group: [{ field: "status" }, { field: "zone" }] }),
      ),
    ).toBe(false);
    // A level fewer is a different grouping.
    expect(
      areSlicesEqual(nested, buildSlice({ group: [{ field: "zone" }] })),
    ).toBe(false);
    expect(areSlicesEqual(nested, buildSlice())).toBe(false);
  });

  it("treats an empty search as equal to no search", () => {
    expect(
      areSlicesEqual(buildSlice({ search: "" }), buildSlice({ search: null })),
    ).toBe(true);
  });

  it("compares operands exactly as request fingerprints do", () => {
    const buildWithOperands = (operands: (string | number)[]) =>
      buildSlice({
        filter: [{ field: "cpu", operator: "gte", operands }],
      });
    // The string "0" never equals the number 0.
    expect(
      areSlicesEqual(buildWithOperands([0]), buildWithOperands(["0"])),
    ).toBe(false);
    // Negative zero and zero are the same value to a fingerprint.
    expect(
      areSlicesEqual(buildWithOperands([-0]), buildWithOperands([0])),
    ).toBe(true);
    // NaN equals itself, exactly like the fingerprint marker.
    expect(
      areSlicesEqual(
        buildWithOperands([Number.NaN]),
        buildWithOperands([Number.NaN]),
      ),
    ).toBe(true);
  });

  it("treats a negative-zero replacement as a semantic no-op", () => {
    const base = buildSlice({
      filter: [{ field: "cpu", operator: "gte", operands: [0] }],
    });
    const result = applyQueryCommand(
      base,
      { ...DEFAULT_WINDOW, page: 2 },
      {
        kind: "setPredicate",
        predicate: { field: "cpu", operator: "gte", operands: [-0] },
      },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.sliceChanged).toBe(false);
    expect(result.window.page).toBe(2);
  });
});
