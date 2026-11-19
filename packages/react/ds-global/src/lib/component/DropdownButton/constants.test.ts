import { describe, expect, it } from "vitest";
import { CHEVRON_ICON } from "./constants.js";

describe("CHEVRON_ICON", () => {
  it("names ds-assets' downward chevron", () => {
    expect(CHEVRON_ICON).toBe("chevron-down");
  });
});
