import type { RelayParameters } from "@canonical/storybook-addon-relay";
import networkResponses from "../../testing/records/networkResponses.js";

/** Key an operation and its variables the same way however they are ordered. */
const keyRequest = (
  operation: string,
  variables: Readonly<Record<string, unknown>>,
): string =>
  JSON.stringify([
    operation,
    Object.keys(variables)
      .sort()
      .map((name) => [name, variables[name]]),
  ]);

const ANSWERS = new Map(
  networkResponses.map(({ operation, variables, response }) => [
    keyRequest(operation, variables),
    response,
  ]),
);

/**
 * A story's `parameters.relay.generateFunction` that answers the network
 * lens's operations with the metro provider's recorded answers, so a story
 * renders the network as the site does, without a provider. The mock payload
 * generator could not draw the map: it would invent lines, routes and
 * positions.
 *
 * @returns The payload builder. It throws on an operation or variables no
 *   recorded answer holds, so a story that issues one fails visibly.
 *
 * @example
 * ```ts
 * parameters: { relay: { generateFunction: answerNetworkQueries() } }
 * ```
 */
export default function answerNetworkQueries(): NonNullable<
  RelayParameters["generateFunction"]
> {
  return (operation) => {
    const { name } = operation.request.node.params;
    const answer = ANSWERS.get(keyRequest(name, operation.request.variables));
    if (answer === undefined) {
      throw new Error(
        `No recorded answer for ${name} at ${JSON.stringify(operation.request.variables)}.`,
      );
    }
    return answer as ReturnType<
      NonNullable<RelayParameters["generateFunction"]>
    >;
  };
}
