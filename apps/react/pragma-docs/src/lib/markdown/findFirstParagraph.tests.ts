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

  it("ends the paragraph at a list that follows it with no blank line", () => {
    expect(
      findFirstParagraph(
        "Icon files must:\n- Use kebab-case naming\n- Use semantic identifiers",
      ),
    ).toBe("Icon files must:");
  });

  it("ends the paragraph at an indented list", () => {
    expect(
      findFirstParagraph(
        "Design tokens follow a strict hierarchy:\n      - Primitive tokens: Raw values that form the foundation of the design system\n      - Semantic tokens: Map semantic concepts to primitive token values\n    ",
      ),
    ).toBe("Design tokens follow a strict hierarchy:");
  });

  it.each([
    ["an ATX heading", "## Usage"],
    ["a quote", "> Quoted."],
    ["a backtick fence", "```ts"],
    ["a tilde fence", "~~~"],
    ["a bullet item", "* An item"],
    ["a plus item", "+ An item"],
    ["an ordered item", "1. An item"],
    ["an ordered item with a parenthesis", "2) An item"],
    ["a setext underline", "---"],
    ["an equals underline", "==="],
    ["a thematic break", "* * *"],
    ["an underscore break", "___"],
    ["a table's delimiter row", "| --- | :-: |"],
    ["a bare table delimiter row", "--- | ---"],
  ])("ends the paragraph at %s", (_name, line) => {
    expect(findFirstParagraph(`The first.\n${line}\nMore.`)).toBe("The first.");
  });

  it("returns the empty string for a text that opens with another block", () => {
    expect(findFirstParagraph("# A heading\n\nA paragraph.")).toBe("");
    expect(findFirstParagraph("- An item\n- Another")).toBe("");
  });

  it("breaks lines at CRLF", () => {
    expect(findFirstParagraph("The first\r\nline.\r\n\r\nThe second.")).toBe(
      "The first\nline.",
    );
  });

  it("breaks lines at a lone CR", () => {
    expect(findFirstParagraph("The first.\r\rThe second.")).toBe("The first.");
  });

  it("keeps a line that only starts like a block", () => {
    expect(
      findFirstParagraph("Three steps:\n-1 is not an item, nor #hash."),
    ).toBe("Three steps:\n-1 is not an item, nor #hash.");
  });
});
