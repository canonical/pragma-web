import { describe, expect, it } from "vitest";
import answerWith from "./answerWith.js";

describe("answerWith", () => {
  it("answers every request with a page of the rows", () => {
    const answer = answerWith([{ id: "a" }]);
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
