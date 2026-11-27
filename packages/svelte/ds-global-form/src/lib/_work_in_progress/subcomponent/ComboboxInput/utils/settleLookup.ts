import type { Option } from "../../../../subcomponent/types.js";
import isPromise from "./isPromise.js";

/**
 * Makes a lookup safe to await: a rejected promise answers `null` (not found)
 * instead of becoming an unhandled rejection. A synchronous answer is kept.
 * @note Pure.
 */
export default function settleLookup(
  answer: Option | null | Promise<Option | null>,
): Option | null | Promise<Option | null> {
  return isPromise(answer) ? answer.catch(() => null) : answer;
}
