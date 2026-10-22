import { describe, expect, it } from "vitest";
import classifyCardinality from "./classifyCardinality.js";

describe("classifyCardinality", () => {
  it("names each of the four combinations", () => {
    expect(classifyCardinality({ required: true, singular: true })).toBe("one");
    expect(classifyCardinality({ required: false, singular: true })).toBe(
      "optional",
    );
    expect(classifyCardinality({ required: true, singular: false })).toBe(
      "many",
    );
    expect(classifyCardinality({ required: false, singular: false })).toBe(
      "any",
    );
  });
});
