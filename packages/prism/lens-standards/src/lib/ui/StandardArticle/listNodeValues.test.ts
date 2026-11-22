import { describe, expect, it } from "vitest";
import listNodeValues from "./listNodeValues.js";

/** A node value naming the entity at `uri`. */
const nodeValue = (uri: string) =>
  ({
    __typename: "StatementNode",
    node: { uri, " $fragmentSpreads": {} },
  }) as never;

describe("listNodeValues", () => {
  it("lists each entity once, skips what is not an entity, and counts every value", () => {
    const groups = [
      {
        predicateUri: "urn:a",
        total: 3,
        values: [nodeValue("urn:x"), { __typename: "%other" } as never],
      },
      { predicateUri: "urn:b", total: 1, values: [nodeValue("urn:x")] },
    ];

    const { nodes, shown, total } = listNodeValues(groups);

    expect(nodes.map(({ uri }) => uri)).toEqual(["urn:x"]);
    expect(shown).toBe(3);
    expect(total).toBe(4);
  });
});
