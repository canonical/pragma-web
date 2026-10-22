import type { Blockquote, Root } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import remarkAdmonitions from "./remarkAdmonitions.js";

const processor = unified().use(remarkParse).use(remarkAdmonitions);

/** Parse a document and run the plugin over it, which edits it in place. */
function transform(source: string): Root {
  const tree = processor.parse(source);
  processor.runSync(tree);
  return tree;
}

/** The first top-level node of a transformed document, as a blockquote. */
function transformQuote(source: string): Blockquote {
  const node = transform(source).children.at(0);
  if (node?.type !== "blockquote") throw new Error("Expected a blockquote");
  return node;
}

describe("remarkAdmonitions", () => {
  it.each([
    ["NOTE", "note"],
    ["TIP", "tip"],
    ["IMPORTANT", "important"],
    ["WARNING", "warning"],
    ["CAUTION", "caution"],
    ["note", "note"],
  ])("marks a [!%s] blockquote as %s", (marker, kind) => {
    const quote = transformQuote(`> [!${marker}]\n> Body.`);

    expect(quote.data?.hProperties?.dataAdmonition).toBe(kind);
  });

  it("removes the marker and keeps the lines after it", () => {
    const quote = transformQuote("> [!NOTE]\n> Body text.");

    expect(quote.children).toMatchObject([
      { type: "paragraph", children: [{ type: "text", value: "Body text." }] },
    ]);
  });

  it("removes a paragraph that held nothing but the marker", () => {
    const quote = transformQuote("> [!TIP]\n>\n> Second paragraph.");

    expect(quote.children).toHaveLength(1);
    expect(quote.children).toMatchObject([
      {
        type: "paragraph",
        children: [{ type: "text", value: "Second paragraph." }],
      },
    ]);
  });

  it("removes the emptied text node when inline markup follows the marker", () => {
    const quote = transformQuote("> [!WARNING]\n**Bold** text.");

    expect(quote.children.at(0)).toMatchObject({
      type: "paragraph",
      children: [{ type: "strong" }, { type: "text", value: " text." }],
    });
  });

  it("leaves a marker followed by text on its own line untouched", () => {
    const quote = transformQuote("> [!NOTE] Inline text.");

    expect(quote.data).toBeUndefined();
    expect(quote.children).toMatchObject([
      {
        type: "paragraph",
        children: [{ type: "text", value: "[!NOTE] Inline text." }],
      },
    ]);
  });

  it("leaves an unknown marker untouched", () => {
    expect(transformQuote("> [!DANGER]\n> Body.").data).toBeUndefined();
  });

  it("leaves a blockquote that does not open with a paragraph untouched", () => {
    expect(transformQuote("> # [!NOTE]\n> Body.").data).toBeUndefined();
  });

  it("leaves a paragraph that does not open with text untouched", () => {
    expect(transformQuote("> *[!NOTE]*\n> Body.").data).toBeUndefined();
  });

  it("leaves an empty blockquote untouched", () => {
    expect(transformQuote(">").data).toBeUndefined();
  });

  it("marks a nested blockquote", () => {
    const outer = transformQuote("> Outer.\n>\n> > [!CAUTION]\n> > Inner.");
    const inner = outer.children.at(1);

    expect(outer.data).toBeUndefined();
    expect(inner).toMatchObject({
      type: "blockquote",
      data: { hProperties: { dataAdmonition: "caution" } },
    });
  });

  it("keeps data the blockquote already carries", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "blockquote",
          data: { hProperties: { className: ["kept"] } },
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "[!NOTE]\nBody." }],
            },
          ],
        },
      ],
    };

    processor.runSync(tree);

    expect(tree.children.at(0)).toMatchObject({
      data: { hProperties: { className: ["kept"], dataAdmonition: "note" } },
    });
  });
});
