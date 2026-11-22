import { describe, expect, it } from "vitest";
import { METRO_NAMESPACE as METRO } from "./constants.js";
import { exampleDataset } from "./dataset.js";
import findPropertyIri from "./findPropertyIri.js";

describe("findPropertyIri", () => {
  it("finds a declared property by its local name", () => {
    expect(findPropertyIri("servesLine", exampleDataset)).toBe(
      `${METRO}servesLine`,
    );
  });

  it("throws for a local name the dataset declares no property of", () => {
    expect(() => findPropertyIri("nothing", exampleDataset)).toThrow(
      "the dataset declares no property named nothing",
    );
  });
});
