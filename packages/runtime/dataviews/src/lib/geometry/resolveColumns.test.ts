import { describe, expect, it } from "vitest";
import resolveColumns from "./resolveColumns.js";
import type { ColumnToSize } from "./types.js";

const buildFixed = (id: string, px: number): ColumnToSize => ({
  id,
  sizing: { kind: "fixed", px },
});

const buildFlex = (
  id: string,
  weight: number,
  minPx: number,
  maxPx?: number,
): ColumnToSize => ({
  id,
  sizing: {
    kind: "flex",
    weight,
    minPx,
    ...(maxPx === undefined ? {} : { maxPx }),
  },
});

const readWidths = (resolved: readonly { id: string; width: number }[]) =>
  Object.fromEntries(resolved.map((column) => [column.id, column.width]));

describe("resolveColumns", () => {
  it("reserves fixed columns at their declared width", () => {
    const result = resolveColumns(
      [buildFixed("name", 200), buildFixed("zone", 100)],
      500,
    );
    expect(readWidths(result)).toEqual({ name: 200, zone: 100 });
  });

  it("shares remaining width among flex columns by weight", () => {
    const result = resolveColumns(
      [
        buildFixed("id", 100),
        buildFlex("name", 2, 100),
        buildFlex("description", 1, 100),
      ],
      700,
    );
    // Remaining 700 - 100 - 200 = 400; name takes 2/3, description 1/3.
    expect(readWidths(result)["name"]).toBeCloseTo(100 + (400 * 2) / 3, 5);
    expect(readWidths(result)["description"]).toBeCloseTo(100 + 400 / 3, 5);
  });

  it("preserves declared widths on overflow so the container scrolls", () => {
    const result = resolveColumns(
      [
        buildFixed("id", 200),
        buildFlex("name", 1, 300),
        buildFlex("zone", 1, 200),
      ],
      400,
    );
    expect(readWidths(result)).toEqual({ id: 200, name: 300, zone: 200 });
  });

  it("caps flexible columns at maxPx and redistributes the unused share", () => {
    const result = resolveColumns(
      [buildFlex("name", 1, 100, 200), buildFlex("description", 1, 100)],
      800,
    );
    // 800 - 200 minima = 600 shared equally: each asks 300 over its minimum.
    // Name caps at 200 and description absorbs the rest.
    expect(readWidths(result)["name"]).toBe(200);
    expect(readWidths(result)["description"]).toBe(600);
  });

  it("leaves leftover space unassigned when every column is capped or fixed", () => {
    const result = resolveColumns(
      [buildFixed("id", 100), buildFlex("name", 1, 100, 200)],
      600,
    );
    expect(readWidths(result)).toEqual({ id: 100, name: 200 });
    const total = result.reduce((sum, column) => sum + column.width, 0);
    expect(total).toBe(300);
    expect(total).toBeLessThan(600);
  });

  it("keeps zero-weight flex columns at their minimum", () => {
    const result = resolveColumns(
      [buildFlex("name", 0, 100), buildFlex("description", 1, 100)],
      500,
    );
    // 500 - 200 minima = 300 extra, all to the only positive weight.
    expect(readWidths(result)["name"]).toBe(100);
    expect(readWidths(result)["description"]).toBe(400);
  });

  it("keeps all zero-weight flex columns at minima with spare width left", () => {
    const result = resolveColumns([buildFlex("name", 0, 100)], 500);
    expect(readWidths(result)["name"]).toBe(100);
    const total = result.reduce((sum, column) => sum + column.width, 0);
    expect(total).toBe(100);
  });

  it("stops redistributing when nothing can absorb the share", () => {
    const result = resolveColumns(
      [buildFlex("stuck", 1, 100, 100), buildFlex("still", 0, 50)],
      500,
    );
    // stuck is already at its cap (minPx === maxPx); still has weight 0.
    expect(readWidths(result)).toEqual({ stuck: 100, still: 50 });
  });

  it("handles a window smaller than a single column", () => {
    const result = resolveColumns([buildFlex("name", 1, 200)], 100);
    expect(readWidths(result)["name"]).toBe(200);
  });

  it("rejects invalid sizing with reasons", () => {
    const cases: ColumnToSize[][] = [
      [{ id: "a", sizing: { kind: "fixed", px: -1 } }],
      [{ id: "a", sizing: { kind: "fixed", px: Number.NaN } }],
      [{ id: "a", sizing: { kind: "flex", weight: -1, minPx: 10 } }],
      [{ id: "a", sizing: { kind: "flex", weight: 1, minPx: Number.NaN } }],
      [
        {
          id: "a",
          sizing: { kind: "flex", weight: 1, minPx: 200, maxPx: 100 },
        },
      ],
      [
        {
          id: "a",
          sizing: {
            kind: "flex",
            weight: 1,
            minPx: 100,
            maxPx: Number.POSITIVE_INFINITY,
          },
        },
      ],
    ];
    for (const columns of cases) {
      expect(() => resolveColumns(columns, 500)).toThrow(/needs|≥/);
    }
    expect(() => resolveColumns([], Number.NaN)).toThrow("available width");
    expect(() => resolveColumns([], -5)).toThrow("available width");
  });

  it("returns widths in the input column order", () => {
    const result = resolveColumns(
      [buildFlex("b", 1, 50), buildFixed("a", 100), buildFlex("c", 1, 50)],
      400,
    );
    expect(result.map((column) => column.id)).toEqual(["b", "a", "c"]);
  });
});
