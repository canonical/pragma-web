import type {
  GraphQLSingularResponse,
  OperationDescriptor,
} from "relay-runtime";
import { MockPayloadGenerator } from "relay-test-utils";
import type { NodePayload } from "./types.js";

/**
 * Answer a search operation with `nodes`, in rank order: each edge's node
 * carries a fixture's values, and every field it does not hold, such as a
 * type's own fields a projection reads, gets a generated mock value.
 *
 * @param nodes - The results, best first.
 * @returns The resolver to hand `environment.mock.resolveMostRecentOperation`
 *   or `queueOperationResolver`.
 */
export default function answerSearch(
  nodes: readonly NodePayload[],
): (operation: OperationDescriptor) => GraphQLSingularResponse {
  return (operation) =>
    MockPayloadGenerator.generate(operation, {
      NodeConnection: () => ({ edges: nodes.map((node) => ({ node })) }),
    });
}
