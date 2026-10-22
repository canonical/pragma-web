import type { Root } from "hast";
import rehypeSanitize from "rehype-sanitize";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { rehypePreset, SANITIZE_SCHEMA } from "./constants.js";

const sanitizer = unified().use(rehypeSanitize, SANITIZE_SCHEMA);

/** A root holding a single blockquote with the given properties. */
function buildQuote(properties: Record<string, string>): Root {
  return {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "blockquote",
        properties,
        children: [{ type: "text", value: "Quoted." }],
      },
    ],
  };
}

describe("SANITIZE_SCHEMA", () => {
  it("keeps a known admonition kind on a blockquote", () => {
    const tree = sanitizer.runSync(buildQuote({ dataAdmonition: "note" }));

    expect(tree.children.at(0)).toMatchObject({
      tagName: "blockquote",
      properties: { dataAdmonition: "note" },
    });
  });

  it("removes an unknown admonition kind", () => {
    const tree = sanitizer.runSync(buildQuote({ dataAdmonition: "evil" }));

    expect(tree.children.at(0)).toMatchObject({
      tagName: "blockquote",
      properties: {},
    });
  });

  it("removes event handlers and script elements", () => {
    const tree = sanitizer.runSync({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: { onClick: "alert(1)" },
          children: [],
        },
        {
          type: "element",
          tagName: "script",
          properties: {},
          children: [{ type: "text", value: "alert(1)" }],
        },
      ],
    });

    expect(tree.children).toEqual([
      { type: "element", tagName: "p", properties: {}, children: [] },
    ]);
  });
});

describe("rehypePreset", () => {
  it("gives headings ids prefixed with user-content-", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: {},
          children: [{ type: "text", value: "Hello world" }],
        },
      ],
    };

    unified()
      .use([...rehypePreset])
      .runSync(tree);

    expect(tree.children.at(0)).toMatchObject({
      properties: { id: "user-content-hello-world" },
    });
  });
});
