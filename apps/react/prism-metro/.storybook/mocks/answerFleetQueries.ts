import type { RelayParameters } from "@canonical/storybook-addon-relay";
import { FLEET_RESPONSES } from "./fleetResponses.js";

/** Whether two variable sets name the same request, key order aside. */
function isSameRequest(
  a: Readonly<Record<string, unknown>>,
  b: Readonly<Record<string, unknown>>,
): boolean {
  const keys = Object.keys(a).sort();
  return (
    keys.join() === Object.keys(b).sort().join() &&
    keys.every((key) => a[key] === b[key])
  );
}

/**
 * Build a story's `parameters.relay.generateFunction` that answers the
 * fleet lens's operations from the metro graph's recorded answers, so a
 * story renders a fleet page the way the site does, with no provider.
 *
 * @returns The payload builder. It throws on a request no answer is
 *   recorded for, so a story that issues one fails visibly instead of
 *   rendering a placeholder.
 */
export default function answerFleetQueries(): NonNullable<
  RelayParameters["generateFunction"]
> {
  return (operation) => {
    const name = operation.request.node.params.name;
    const { variables } = operation.request;
    const recorded = FLEET_RESPONSES.find(
      (entry) =>
        entry.operation === name && isSameRequest(entry.variables, variables),
    );
    if (recorded === undefined) {
      throw new Error(
        `No fleet answer is recorded for ${name} at ${JSON.stringify(variables)}.`,
      );
    }
    return structuredClone(recorded.response) as ReturnType<
      NonNullable<RelayParameters["generateFunction"]>
    >;
  };
}
