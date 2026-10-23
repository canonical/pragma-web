import { describe, expect, it } from "vitest";
import {
  buildStandardEntityVariables,
  readUriParam,
} from "./standardEntityQuery.js";

const URI = "http://pragma.canonical.com/codestandards#code.array.safe_access";

describe("readUriParam", () => {
  it("returns the decoded address", () => {
    expect(readUriParam({ uri: URI })).toBe(URI);
  });

  it("asserts the shape: a missing, empty or non-string address throws", () => {
    expect(() => readUriParam({})).toThrow(/non-empty string/);
    expect(() => readUriParam({ uri: "" })).toThrow(/non-empty string/);
    expect(() => readUriParam({ uri: 42 })).toThrow(/non-empty string/);
  });
});

describe("buildStandardEntityVariables", () => {
  it("pairs the standard's address with the bound class", () => {
    expect(buildStandardEntityVariables("cs:CodeStandard", URI)).toEqual({
      uri: URI,
      classUri: "cs:CodeStandard",
    });
  });
});
