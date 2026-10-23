import { describe, expect, it } from "vitest";
import { LABEL_CHARACTERS } from "./constants.js";
import truncateLabel from "./truncateLabel.js";

describe("truncateLabel", () => {
  it("keeps a label that fits", () => {
    expect(truncateLabel("Read a standard")).toBe("Read a standard");
  });

  it("cuts a longer label to the node's width, ending in an ellipsis", () => {
    const cut = truncateLabel("x".repeat(LABEL_CHARACTERS + 5));
    expect(cut).toHaveLength(LABEL_CHARACTERS);
    expect(cut.endsWith("…")).toBe(true);
  });
});
