import { OPERATOR_DELIMITER } from "./constants.js";
import type { WireKey } from "./types.js";

const DIGITS = /^\d+$/;

/** A conjunct's ordinal as spelled, or null when the text is no ordinal. */
const readOrdinal = (text: string): number | null => {
  if (!DIGITS.test(text)) {
    return null;
  }
  // Digits alone are not enough: past the safe range an ordinal reads as a
  // neighbouring number.
  const ordinal = Number(text);
  return Number.isSafeInteger(ordinal) ? ordinal : null;
};

/**
 * Split one parameter name into the segments of a filter's key: the field
 * before the first delimiter, the operator after it, and the ordinal after
 * the second. Digits with leading zeros read as their number — `__01` is
 * ordinal 1 — and anything else after the second delimiter, a further
 * delimiter included, is no ordinal. Pure: what the segments mean is the
 * reader's to decide.
 */
export default function readWireKey(key: string): WireKey {
  const at = key.indexOf(OPERATOR_DELIMITER);
  if (at === -1) {
    return { field: key, operator: null, ordinal: 0 };
  }
  const field = key.slice(0, at);
  const rest = key.slice(at + OPERATOR_DELIMITER.length);
  const next = rest.indexOf(OPERATOR_DELIMITER);
  if (next === -1) {
    return { field, operator: rest, ordinal: 0 };
  }
  return {
    field,
    operator: rest.slice(0, next),
    ordinal: readOrdinal(rest.slice(next + OPERATOR_DELIMITER.length)),
  };
}
