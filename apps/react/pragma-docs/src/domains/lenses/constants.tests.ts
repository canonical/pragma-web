import { describe, expect, it } from "vitest";
import { PREFIXED_CURIE_PATTERN } from "../../../testing/fixtures.js";
import { STANDARDS_BINDING } from "./constants.js";

describe("STANDARDS_BINDING", () => {
  it("states the class in the prefixed form, never an absolute IRI", () => {
    expect(STANDARDS_BINDING.classUri).toMatch(PREFIXED_CURIE_PATTERN);
  });
});
