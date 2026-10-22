import { describe, expect, it } from "vitest";
import { duplicateHeadingsDocument } from "../../../testing/fixtures.js";
import extractHeadings from "./extractHeadings.js";

describe("extractHeadings", () => {
  it("lists each heading's depth, id and text in document order", () => {
    expect(extractHeadings("# One\n\n### Three\n\n###### Six")).toEqual([
      { depth: 1, id: "user-content-one", text: "One" },
      { depth: 3, id: "user-content-three", text: "Three" },
      { depth: 6, id: "user-content-six", text: "Six" },
    ]);
  });

  it("flattens inline markup, suffixes duplicates and skips the footnote label", () => {
    expect(extractHeadings(duplicateHeadingsDocument)).toEqual([
      { depth: 1, id: "user-content-hello-world", text: "Hello world" },
      { depth: 2, id: "user-content-hello-world-1", text: "Hello world" },
    ]);
  });

  it("skips headings written in raw HTML, which are not rendered", () => {
    expect(extractHeadings("<h2>Raw</h2>\n\n## Real")).toEqual([
      { depth: 2, id: "user-content-real", text: "Real" },
    ]);
  });

  it("returns no headings for an empty document", () => {
    expect(extractHeadings("")).toEqual([]);
  });
});
