import { describe, expect, it } from "vitest";
import answering from "./answering.js";

describe("answering", () => {
  it("answers every request with a page of the rows", () => {
    const answer = answering([{ id: "a" }]);
    expect(
      answer({
        requestId: "r",
        slice: { filter: [], search: null, sort: [], group: [] },
        window: { page: 1, size: 25, cursor: null, collapsed: [] },
        facets: [],
      }).rows,
    ).toEqual([{ id: "a" }]);
  });
});
