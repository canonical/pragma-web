import { describe, expect, it } from "vitest";
import findCuriePrefix from "./findCuriePrefix.js";

describe("findCuriePrefix", () => {
  it("finds the prefix of a compact address", () => {
    expect(findCuriePrefix("ds:Layout")).toBe("ds");
  });

  it("finds a prefix whose local part holds further colons and slashes", () => {
    expect(findCuriePrefix("metro:station/kings-cross")).toBe("metro");
    expect(findCuriePrefix("ds:a:b")).toBe("ds");
  });

  it("finds a prefix with dots, hyphens and underscores", () => {
    expect(findCuriePrefix("web-code.standards_v2:react")).toBe(
      "web-code.standards_v2",
    );
  });

  it("finds no prefix in an absolute IRI the provider did not compact", () => {
    expect(findCuriePrefix("https://ds.canonical.com/Layout")).toBeUndefined();
  });

  it("finds no prefix in a type name, which has no colon", () => {
    expect(findCuriePrefix("KeyValue")).toBeUndefined();
  });

  it("finds no prefix before a colon that no prefix name precedes", () => {
    expect(findCuriePrefix(":Layout")).toBeUndefined();
    expect(findCuriePrefix("1ds:Layout")).toBeUndefined();
  });
});
