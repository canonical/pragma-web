import {
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLNonNull,
  isInterfaceType,
} from "graphql";
import { describe, expect, it } from "vitest";
import { CORPUS_REFS_ROOT } from "../../testing/corpus.js";
import { createPragmaProvider } from "../provider/index.js";
import { findNodeConnection } from "./findNodeConnection.js";

describe("findNodeConnection", () => {
  it("reaches NodeConnection from the compiled Node interface", async () => {
    const { api } = await createPragmaProvider({ refsRoot: CORPUS_REFS_ROOT });
    const node = api.schema.getType("Node");
    if (!isInterfaceType(node)) throw new Error("the schema has no Node");
    expect(findNodeConnection(node)).toBe(api.schema.getType("NodeConnection"));
  });

  it("names the missing hop when Node has no _meta", () => {
    const node = new GraphQLInterfaceType({
      name: "Node",
      fields: { uri: { type: new GraphQLNonNull(GraphQLID) } },
    });
    expect(() => findNodeConnection(node)).toThrow(
      "Node._meta is not an object-typed field",
    );
  });

  it("names the missing hop when a field is not object-typed", () => {
    const node = new GraphQLInterfaceType({
      name: "Node",
      fields: { _meta: { type: new GraphQLNonNull(GraphQLID) } },
    });
    expect(() => findNodeConnection(node)).toThrow(
      "Node._meta is not an object-typed field",
    );
  });
});
