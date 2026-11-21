import type { GraphQLInterfaceType, GraphQLObjectType } from "graphql";
import { followField } from "./followField.js";

/**
 * The compiled schema's `NodeConnection`, reached from the `Node` interface.
 *
 * The extension factory's lookups see the generated object types and
 * interfaces but not the connection types, which the compiler builds in a
 * registry of its own; declaring a second type of the same name would fail
 * schema validation. The contract guarantees a path to it instead:
 * `Node._meta: EntityMeta!`, `EntityMeta.type: OntologyClass!`,
 * `OntologyClass.instances: NodeConnection!`. Call this once the schema's
 * types exist: from an extension factory, which the compiler runs after
 * building them, or from a field thunk.
 *
 * @param node - The schema's `Node` interface.
 * @returns The `NodeConnection` object type.
 * @throws Naming the hop that is missing, when the path is broken.
 */
export const findNodeConnection = (
  node: GraphQLInterfaceType,
): GraphQLObjectType =>
  followField(followField(followField(node, "_meta"), "type"), "instances");
