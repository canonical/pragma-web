import { describe, expect, it } from "vitest";
import capitalizeLabel from "./capitalizeLabel.js";

describe("capitalizeLabel", () => {
  it("upper-cases a label's first letter and keeps the rest as declared", () => {
    expect(capitalizeLabel("formations")).toBe("Formations");
    expect(capitalizeLabel("served by")).toBe("Served by");
    expect(capitalizeLabel("Lines")).toBe("Lines");
  });

  it("leaves an empty label empty", () => {
    expect(capitalizeLabel("")).toBe("");
  });
});
