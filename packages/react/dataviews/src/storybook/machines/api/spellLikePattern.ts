import type { ApiHeldTextOperator } from "./types.js";

/** The characters a `LIKE` pattern must escape to match them literally. */
const LIKE_SPECIAL = /[\\%_]/g;

/**
 * Spell the `LIKE` pattern a backend is sent for text a value equals,
 * contains, starts or ends with: `\`, `%` and `_` escaped with `\`, then `%`
 * on the side the value may run on past the text, so the operand is looked
 * for literally where the operator says.
 */
export default function spellLikePattern(
  operator: ApiHeldTextOperator,
  operand: string,
): string {
  const literal = operand.replace(LIKE_SPECIAL, (special) => `\\${special}`);
  const before = operator === "contains" || operator === "endsWith" ? "%" : "";
  const after = operator === "contains" || operator === "startsWith" ? "%" : "";
  return `${before}${literal}${after}`;
}
