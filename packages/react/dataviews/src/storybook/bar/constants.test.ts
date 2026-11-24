import { describe, expect, it } from "vitest";
import { FRAME_KEYS, NARROW_QUERY, PHONE_SIZE } from "./constants.js";

describe("the bar stories' constants", () => {
  it("keeps the frame's own parameters", () => {
    expect(FRAME_KEYS).toEqual(["id", "viewMode", "args", "globals"]);
  });

  it("starts the narrow stories on two filter chips at a phone's width", () => {
    expect(new URLSearchParams(NARROW_QUERY).get("status")).toBe("deployed");
    expect(PHONE_SIZE).toBe("min(22.5rem, 100%)");
  });
});
