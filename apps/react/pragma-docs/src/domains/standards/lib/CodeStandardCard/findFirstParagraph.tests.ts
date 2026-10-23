import { describe, expect, it } from "vitest";
import findFirstParagraph from "./findFirstParagraph.js";

describe("findFirstParagraph", () => {
  it("returns a text of one paragraph whole, trimmed", () => {
    expect(findFirstParagraph("Use `.at()`\nfor array access.  \n")).toBe(
      "Use `.at()`\nfor array access.",
    );
  });

  it("returns the first of several paragraphs", () => {
    expect(
      findFirstParagraph("The **first** one.\n\nThe second.\n \nThe third."),
    ).toBe("The **first** one.");
  });

  it("skips the blank lines before the first paragraph", () => {
    expect(findFirstParagraph("\n\n  \nThe first.\n\nThe second.")).toBe(
      "The first.",
    );
  });

  it("returns the empty string for a text with no paragraph", () => {
    expect(findFirstParagraph(" \n\n ")).toBe("");
  });
});
