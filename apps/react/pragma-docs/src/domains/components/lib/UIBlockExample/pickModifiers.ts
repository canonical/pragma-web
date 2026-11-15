import { BLOCK_EXAMPLE_FAMILIES } from "./constants.js";
import type { BlockExampleName } from "./types.js";

/**
 * The modifiers among `modifiers` whose family `example` honours, as the
 * published component's props: a family it has no prop for is left out.
 */
export default function pickModifiers(
  example: BlockExampleName,
  modifiers: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const families = BLOCK_EXAMPLE_FAMILIES[example];
  return Object.fromEntries(
    Object.entries(modifiers).filter(([family]) => families.includes(family)),
  );
}
