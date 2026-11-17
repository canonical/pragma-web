import { describe, expect, it } from "vitest";
import createListing from "./createListing.js";
import listIds from "./listIds.js";

describe("listIds", () => {
  it("answers the listing's ids in a new array on every call", () => {
    const listing = createListing({ ids: [5, 6] });
    expect(listIds(listing)).toEqual([5, 6]);
    expect(listIds(listing)).not.toBe(listing.ids);
    expect(listIds(listing)).not.toBe(listIds(listing));
  });
});
