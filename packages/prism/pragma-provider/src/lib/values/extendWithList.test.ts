import { type CompilerContext, executeLocal } from "@canonical/ke-graphql";
import {
  buildSchema,
  type ExecutionResult,
  type GraphQLObjectType,
} from "graphql";
import { describe, expect, it } from "vitest";
import { extendWithList } from "./extendWithList.js";

/** The least schema `extendWithList` serves on: a `Node` reaching its connection. */
const NODE_SDL = `
interface Node { uri: ID! _meta: NodeMeta! }
type NodeMeta { type: NodeClass! }
type NodeClass { instances: NodeConnection! }
type NodeConnection { edges: [NodeEdge!]! pageInfo: PageInfo! }
type NodeEdge { node: Node! cursor: String! }
type PageInfo { hasNextPage: Boolean! }
type Query { ontologyClass(uri: String!): NodeClass }
`;

describe("extendWithList", () => {
  it("throws when the schema has no Node interface", () => {
    const schema = buildSchema("type Query { hello: String }");
    expect(() => extendWithList(schema)).toThrow(
      "the compiled schema has no Node interface to serve values on",
    );
  });

  it("passes on an error the served schema answers a list query with", async () => {
    const schema = buildSchema(NODE_SDL);
    (
      schema.getQueryType() as GraphQLObjectType
    ).getFields().ontologyClass.resolve = () => {
      throw new Error("the store is closed");
    };
    const source = '{ facetedInstances(classUri: "urn:x") { totalCount } }';
    const result = (await executeLocal({
      schema: extendWithList(schema),
      source,
      // The failing resolver reads no loader.
      contextValue: {} as CompilerContext,
    })) as ExecutionResult;
    expect(result.errors?.at(0)?.message).toBe("the store is closed");
  });
});
