import { describe, expect, it } from "vitest";
import truncateLabel from "./truncateLabel.js";

describe("truncateLabel", () => {
  it("keeps a label that fits, up to the boundary", () => {
    expect(truncateLabel("Read", 8)).toBe("Read");
    expect(truncateLabel("Standard", 8)).toBe("Standard");
  });

  it("cuts a longer label to the box, ending in an ellipsis", () => {
    const cut = truncateLabel("Standards", 8);
    expect(cut).toBe("Standar…");
    expect(cut).toHaveLength(8);
  });
});
