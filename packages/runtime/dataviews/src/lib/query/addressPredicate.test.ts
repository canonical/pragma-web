import { describe, expect, it } from "vitest";
import addressPredicate from "./addressPredicate.js";

describe("addressPredicate", () => {
  it("joins the field and operator with a NUL", () => {
    expect(addressPredicate("cpu", "gte")).toBe("cpu\u0000gte");
  });

  it("gives each operator over one field its own address", () => {
    expect(addressPredicate("cpu", "gte")).not.toBe(
      addressPredicate("cpu", "lte"),
    );
  });
});
