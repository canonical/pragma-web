import { describe, expect, it } from "vitest";
import formatIdent from "./formatIdent.js";

describe("formatIdent", () => {
  it("keeps word characters and dashes, and replaces the rest", () => {
    expect(formatIdent("_r_1_")).toBe("_r_1_");
    expect(formatIdent("app:1.«r2»")).toBe("app_1__r2_");
  });
});
