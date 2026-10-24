import { describe, expect, it } from "vitest";
import buildGroupAnchorId from "./buildGroupAnchorId.js";

describe("buildGroupAnchorId", () => {
  it("slugs the local name after a fragment", () => {
    expect(
      buildGroupAnchorId("http://pragma.canonical.com/codestandards#StyleRule"),
    ).toBe("standards-group-stylerule");
  });

  it("slugs the local name after the last slash", () => {
    expect(buildGroupAnchorId("https://metro.example/onto/Line_Stop")).toBe(
      "standards-group-line-stop",
    );
  });

  it("slugs a bare name as it is", () => {
    expect(buildGroupAnchorId("CodeStandard")).toBe(
      "standards-group-codestandard",
    );
  });

  it("slugs the whole IRI when it has no local name", () => {
    expect(buildGroupAnchorId("https://metro.example/")).toBe(
      "standards-group-https-metro-example-",
    );
  });
});
