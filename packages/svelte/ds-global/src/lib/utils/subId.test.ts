import { describe, expect, it } from "vitest";
import { createSubId, subId } from "./subId.js";

describe("subId", () => {
  it("combines an ID and sub-ID with a hyphen", () => {
    expect(subId("field", "label")).toBe("field-label");
  });

  it("creates multiple sub-IDs with the default or a custom separator", () => {
    const defaultSubId = createSubId("field");
    const customSubId = createSubId("field", "|");

    expect(defaultSubId("label")).toBe("field-label");
    expect(defaultSubId("input")).toBe("field-input");
    expect(customSubId("label")).toBe("field|label");
  });
});
