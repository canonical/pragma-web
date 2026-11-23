import { describe, expect, it } from "vitest";
import pluralize from "./pluralize.js";

describe("pluralize", () => {
  it("names one of a noun in the singular", () => {
    expect(pluralize(1, "term")).toBe("1 term");
  });

  it("names any other count in the plural", () => {
    expect(pluralize(0, "term")).toBe("0 terms");
    expect(pluralize(2, "term")).toBe("2 terms");
  });
});
