import type { GraphQLExecute } from "@canonical/prism-core";
import { createExampleProvider } from "@canonical/prism-graph-example";
import { graphql } from "graphql";

/**
 * Create a `GraphQLExecute` over the metro provider, in process: each call
 * executes the operation against the provider's schema and root value, with
 * no server and no socket.
 *
 * @returns The executor.
 */
export default function createMetroExecute(): GraphQLExecute {
  const { schema, rootValue } = createExampleProvider();
  return (source, variableValues) =>
    graphql({
      schema,
      rootValue,
      source,
      variableValues: { ...variableValues },
    });
}
