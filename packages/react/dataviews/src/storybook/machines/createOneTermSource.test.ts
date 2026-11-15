import { describe, expect, it } from "vitest";
import createOneTermSource from "./createOneTermSource.js";

describe("createOneTermSource", () => {
  it("orders by one term at a time", () => {
    expect(createOneTermSource().capabilities.sort.terms).toBe(1);
  });
});
