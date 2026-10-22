import { describe, expect, it } from "vitest";
import { NORTHGATE_CURIE } from "../../testing/fixtures.js";
import readUriParam from "./readUriParam.js";

describe("readUriParam", () => {
  it("returns the decoded address", () => {
    expect(readUriParam({ uri: NORTHGATE_CURIE })).toBe(NORTHGATE_CURIE);
  });

  it("asserts the shape: a missing, empty or non-string address throws", () => {
    expect(() => readUriParam({})).toThrow(/non-empty string/);
    expect(() => readUriParam({ uri: "" })).toThrow(/non-empty string/);
    expect(() => readUriParam({ uri: 42 })).toThrow(/non-empty string/);
  });
});
