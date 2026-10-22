import type { StripSpacing } from "./types.js";

/**
 * Space a line strip's stops evenly along its rule: each stop at the centre
 * of an equal share of the strip. The rule runs from the first stop to the
 * last, and on a loop it runs on past both ends, to the strip's edges, where
 * the service continues.
 *
 * @param count - How many stops the route calls at.
 * @param isLoop - Whether the route continues from its last stop to its first.
 * @returns The rule's ends and each stop's place, as fractions of the strip.
 * @throws When `count` is not a positive whole number.
 */
export default function spaceStripStops(
  count: number,
  isLoop: boolean,
): StripSpacing {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`a strip needs at least one stop, not ${count}`);
  }
  const stops = Array.from(
    { length: count },
    (_, index) => (index + 0.5) / count,
  );
  return {
    ruleStart: isLoop ? 0 : (stops.at(0) as number),
    ruleEnd: isLoop ? 1 : (stops.at(-1) as number),
    stops,
  };
}
