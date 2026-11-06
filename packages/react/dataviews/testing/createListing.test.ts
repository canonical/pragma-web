import { describe, expect, it } from "vitest";
import createListing from "./createListing.js";

describe("createListing", () => {
  it("lists ids 1 and 2, other 9, on page 1 by default", () => {
    expect(createListing()).toEqual({ ids: [1, 2], other: [9], page: 1 });
  });

  it("takes each part it is given", () => {
    expect(createListing({ ids: [3], other: [], page: 2 })).toEqual({
      ids: [3],
      other: [],
      page: 2,
    });
  });

  it("builds new lists on every call", () => {
    const ids = [4];
    const listing = createListing({ ids });
    expect(listing.ids).not.toBe(ids);
    expect(createListing().ids).not.toBe(createListing().ids);
  });
});
