import { describe, expect, it } from "vitest";
import { ENTRY_ITEM_ID } from "./constants.js";

describe("constants", () => {
  it("names QueryInput's own entry item", () => {
    expect(ENTRY_ITEM_ID).toBe("entry");
  });
});
