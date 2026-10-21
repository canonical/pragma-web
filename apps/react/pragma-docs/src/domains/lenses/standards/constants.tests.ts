import { describe, expect, it } from "vitest";
import { PREFIXED_CURIE_PATTERN } from "../../../../testing/fixtures.js";
import { STANDARD_CLASS_URI } from "./constants.js";

describe("STANDARD_CLASS_URI", () => {
  it("states the class in the prefixed form, never an absolute IRI", () => {
    expect(STANDARD_CLASS_URI).toMatch(PREFIXED_CURIE_PATTERN);
  });
});
