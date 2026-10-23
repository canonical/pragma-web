import { describe, expect, it } from "vitest";
import readCuriePrefix from "./readCuriePrefix.js";

describe("readCuriePrefix", () => {
  it("reads a compact address's prefix with its colon", () => {
    expect(readCuriePrefix("cs:code.array.safe_access")).toBe("cs:");
    expect(readCuriePrefix("metro:northgate")).toBe("metro:");
  });

  it("reads none from an absolute IRI or a bare name", () => {
    expect(readCuriePrefix("http://pragma.canonical.com/x#y")).toBeUndefined();
    expect(readCuriePrefix("northgate")).toBeUndefined();
  });
});
