import { describe, expect, it } from "vitest";
import { selectLiteral } from "./selectLiteral.js";

describe("selectLiteral", () => {
  it("answers the exact tag, ignoring case", () => {
    expect(selectLiteral({ "en-GB": "colour", en: "color" }, "EN-gb")).toBe(
      "colour",
    );
  });

  it("never lets a language match a regional tag", () => {
    expect(selectLiteral({ "en-GB": "colour" }, "en")).toBeNull();
  });

  it("falls back to the untagged literal", () => {
    expect(selectLiteral({ fr: "couleur", "": "colour" }, "de")).toBe("colour");
  });

  it("answers only the untagged literal without a language", () => {
    const literals = { en: "color", "": "colour" };
    expect(selectLiteral(literals, null)).toBe("colour");
    expect(selectLiteral(literals, undefined)).toBe("colour");
    expect(selectLiteral({ en: "color" }, undefined)).toBeNull();
  });
});
