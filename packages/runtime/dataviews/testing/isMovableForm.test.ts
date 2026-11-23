import { describe, expect, it } from "vitest";
import isMovableForm from "./isMovableForm.js";

describe("isMovableForm", () => {
  it("accepts a function, a class and a plain variable", () => {
    expect(isMovableForm("function")).toBe(true);
    expect(isMovableForm("class")).toBe(true);
    expect(isMovableForm("variable")).toBe(true);
  });

  it("refuses a wrapped variable and anything else", () => {
    expect(isMovableForm("wrapped")).toBe(false);
    expect(isMovableForm("other")).toBe(false);
  });
});
