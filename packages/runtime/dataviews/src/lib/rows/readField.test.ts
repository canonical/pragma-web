import { describe, expect, it } from "vitest";
import readField from "./readField.js";

describe("readField", () => {
  it("reads a field the row carries", () => {
    expect(readField({ name: "alpha" }, "name")).toBe("alpha");
  });

  it("reads nothing for a field the row does not carry", () => {
    expect(readField({ name: "alpha" }, "cpu")).toBeUndefined();
  });

  it("reads nothing for an inherited member", () => {
    expect(readField({}, "constructor")).toBeUndefined();
    expect(readField({}, "toString")).toBeUndefined();
  });
});
