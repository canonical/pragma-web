import { describe, expect, it } from "vitest";
import { PREFIXED_CURIE_PATTERN } from "../../../testing/fixtures.js";
import {
  LOBBY_COMPONENT_CLASS,
  LOBBY_PATTERN_CLASS,
  LOBBY_STANDARD_CLASS,
} from "./constants.js";

const LOBBY_CLASSES = [
  LOBBY_COMPONENT_CLASS,
  LOBBY_PATTERN_CLASS,
  LOBBY_STANDARD_CLASS,
] as const;

describe("the lobby's door classes", () => {
  it("states each class in the prefixed form, never an absolute IRI", () => {
    expect(
      LOBBY_CLASSES.filter((uri) => !PREFIXED_CURIE_PATTERN.test(uri)),
    ).toEqual([]);
  });

  it("counts a distinct class behind each door", () => {
    expect(new Set(LOBBY_CLASSES).size).toBe(LOBBY_CLASSES.length);
  });
});
