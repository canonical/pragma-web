import { ADMONITION_KINDS } from "./constants.js";
import type { AdmonitionKind } from "./types.js";

/**
 * Tell whether a value is one of the five admonition kinds.
 *
 * The value usually comes from a rendered element's `data-admonition`
 * attribute, which arrives untyped, so any value is accepted.
 */
export default function isAdmonitionKind(
  value: unknown,
): value is AdmonitionKind {
  return ADMONITION_KINDS.some((kind) => kind === value);
}
