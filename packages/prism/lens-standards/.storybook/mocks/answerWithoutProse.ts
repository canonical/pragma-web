import type { RelayParameters } from "@canonical/storybook-addon-relay";
import { MockPayloadGenerator } from "relay-test-utils";

/**
 * Build a story's `parameters.relay.generateFunction` that answers as the
 * resolvers do, save that the standard has no prose: the reading page's
 * `body` comes back null, as a provider answers for a standard with none,
 * so the article falls back to its description. The mock payload generator
 * fills every field it is asked for, so the null is set on its payload.
 *
 * @returns The payload builder.
 *
 * @example
 * ```ts
 * parameters: {
 *   relay: {
 *     mockResolvers: resolveStandards(),
 *     generateFunction: answerWithoutProse(),
 *   },
 * }
 * ```
 */
export default function answerWithoutProse(): NonNullable<
  RelayParameters["generateFunction"]
> {
  return (operation, mockResolvers) => {
    const payload = MockPayloadGenerator.generate(operation, mockResolvers);
    return { ...payload, data: { ...payload.data, body: null } };
  };
}
