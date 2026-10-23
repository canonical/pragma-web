import type { RelayParameters } from "@canonical/storybook-addon-relay";
import type { Variables } from "relay-runtime";
import metroResponses from "../../testing/records/metroResponses.js";

/**
 * Key a request by its operation and its variables, the variables' keys
 * sorted so that their order does not matter.
 */
const keyRequest = (operation: string, variables: Variables): string =>
  JSON.stringify([
    operation,
    Object.keys(variables)
      .sort()
      .map((name) => [name, variables[name]]),
  ]);

/**
 * Build a story's `parameters.relay.generateFunction` that answers every
 * operation the lens issues with the metro graph's recorded response to
 * it, the answers the lens's own suites read, so a story renders the lens
 * over real data with no provider.
 *
 * @returns The payload builder. It throws on a request no recording holds,
 *   naming the operation and its variables, so a story that issues one
 *   fails visibly instead of rendering placeholders.
 *
 * @example
 * ```ts
 * parameters: { relay: { generateFunction: answerFromRecords() } }
 * ```
 */
export default function answerFromRecords(): NonNullable<
  RelayParameters["generateFunction"]
> {
  const responses = new Map(
    metroResponses.map(({ operation, variables, response }) => [
      keyRequest(operation, variables),
      response,
    ]),
  );
  return (operation) => {
    const { name } = operation.request.node.params;
    const { variables } = operation.request;
    const response = responses.get(keyRequest(name, variables));
    if (response === undefined) {
      throw new Error(
        `no recorded response for ${name} at ${JSON.stringify(variables)}`,
      );
    }
    return structuredClone(response) as ReturnType<
      NonNullable<RelayParameters["generateFunction"]>
    >;
  };
}
