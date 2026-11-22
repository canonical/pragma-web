import { describe, expect, it } from "vitest";
import omitSearch from "./omitSearch.js";

const SDL = `# The provider's roots.
type Query {
  node(id: ID!): Node
}

extend type Query {
  "Prose."
  prose(uri: ID!): String
  "Search."
  search(
    text: String!
  ): SearchConnection!
  source(uri: ID!): String
}

"A page of results."
type SearchConnection {
  facets: [TypeFacet!]!
}

"A facet."
type TypeFacet {
  count: Int!
}

type Node {
  uri: ID!
}
`;

describe("omitSearch", () => {
  it("leaves out Query.search and the types only it reads, keeping every other line", () => {
    expect(omitSearch(SDL)).toBe(`# The provider's roots.
type Query {
  node(id: ID!): Node
}

extend type Query {
  "Prose."
  prose(uri: ID!): String
  source(uri: ID!): String
}

type Node {
  uri: ID!
}
`);
  });

  it("returns an SDL that declares no search as it is", () => {
    const sdl = "type Query {\n  node(id: ID!): Node\n}\n";
    expect(omitSearch(sdl)).toBe(sdl);
  });

  it("leaves out a search type on the SDL's last line, which ends without a newline", () => {
    const sdl =
      "type Query {\n  node(id: ID!): Node\n}\n\ntype TypeFacet {\n  count: Int!\n}";
    expect(omitSearch(sdl)).toBe("type Query {\n  node(id: ID!): Node\n}\n\n");
  });

  it("keeps the definitions that have no fields, such as scalars and enums", () => {
    const sdl =
      "scalar Date\n\nenum Kind {\n  CLASS\n}\n\ntype Query {\n  search: SearchConnection!\n  node(id: ID!): Node\n}\n";
    expect(omitSearch(sdl)).toBe(
      "scalar Date\n\nenum Kind {\n  CLASS\n}\n\ntype Query {\n  node(id: ID!): Node\n}\n",
    );
  });
});
