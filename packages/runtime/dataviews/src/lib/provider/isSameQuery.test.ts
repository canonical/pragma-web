import { describe, expect, it } from "vitest";
import { DEFAULT_WINDOW, EMPTY_SLICE, type Query } from "../query/index.js";
import isSameQuery from "./isSameQuery.js";

const query: Query = { slice: EMPTY_SLICE, window: DEFAULT_WINDOW };

describe("isSameQuery", () => {
  it("reads equal slices and spelled window members as the same", () => {
    expect(
      isSameQuery(query, {
        slice: { ...EMPTY_SLICE },
        window: { ...DEFAULT_WINDOW, collapsed: [["failed"]] },
      }),
    ).toBe(true);
  });

  it("tells apart a slice, a page, a size or a cursor", () => {
    for (const other of [
      { ...query, slice: { ...EMPTY_SLICE, search: "web" } },
      { ...query, window: { ...DEFAULT_WINDOW, page: 2 } },
      { ...query, window: { ...DEFAULT_WINDOW, size: 10 } },
      { ...query, window: { ...DEFAULT_WINDOW, cursor: "c1" } },
    ]) {
      expect(isSameQuery(query, other)).toBe(false);
    }
  });
});
