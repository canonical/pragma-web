// @vitest-environment node

import { createExampleProvider } from "@canonical/prism-graph-example";
import { describe, expect, it } from "vitest";
import spliceQueryExtension from "./spliceQueryExtension.js";

/** The contract's root type, then a provider's type and its root fields. */
const EXTENDED = `type Query {
  node(id: ID!): Node
}

type Prose {
  lang: String!
}

extend type Query {
  "The prose."
  prose(uri: ID!): Prose
  search(text: String!): NodeConnection!
}
`;

describe("spliceQueryExtension", () => {
  it("moves the extension's fields into type Query and drops the block", () => {
    expect(spliceQueryExtension(EXTENDED)).toBe(`type Query {
  node(id: ID!): Node
  "The prose."
  prose(uri: ID!): Prose
  search(text: String!): NodeConnection!
}

type Prose {
  lang: String!
}
`);
  });

  it("returns an SDL that extends Query nowhere as it is", () => {
    const sdl = "type Query {\n  node(id: ID!): Node\n}\n";
    expect(spliceQueryExtension(sdl)).toBe(sdl);
  });

  it("refuses an SDL that extends Query twice", () => {
    expect(() =>
      spliceQueryExtension(
        `${EXTENDED}\nextend type Query {\n  other: String\n}\n`,
      ),
    ).toThrow("the SDL extends Query 2 times");
  });

  it("refuses an SDL that extends Query but declares no type Query", () => {
    expect(() =>
      spliceQueryExtension("extend type Query {\n  other: String\n}\n"),
    ).toThrow("the SDL extends Query but declares no `type Query` block");
  });

  it("leaves every root field of the metro provider in type Query", () => {
    const sdl = spliceQueryExtension(createExampleProvider().sdl);
    expect(sdl).not.toContain("extend type Query");
    const query = /^type Query \{\n([\s\S]*?)^\}/m.exec(sdl)?.at(1) ?? "";
    expect(query).toContain("\n  prose(uri: ID!): Prose\n");
    expect(query).toContain(
      "\n  search(text: String!, first: Int, after: String): NodeConnection!\n",
    );
  });
});
