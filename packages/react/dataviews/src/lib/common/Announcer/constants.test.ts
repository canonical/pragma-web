import { describe, expect, it } from "vitest";
import {
  CLEAR_DELAY_MS,
  COALESCE_DELAY_MS,
  ORDERING_TOPIC,
  SORT_REFUSAL_TOPIC,
} from "./constants.js";

describe("constants", () => {
  it("coalesces within a tenth of a second", () => {
    expect(COALESCE_DELAY_MS).toBe(100);
  });

  it("clears after seven seconds", () => {
    expect(CLEAR_DELAY_MS).toBe(7000);
  });

  it("names two distinct topics", () => {
    expect(ORDERING_TOPIC).toBe("ordering");
    expect(SORT_REFUSAL_TOPIC).toBe("sort-refusal");
  });
});
