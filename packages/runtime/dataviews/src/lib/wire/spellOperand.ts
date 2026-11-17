import type { PredicateOperand } from "../query/index.js";

/**
 * A number in the plain decimal the input grammar reads. A number's own
 * string form switches to exponent notation beyond 1e21 and below 1e-6;
 * moving the point respells the same shortest round-trip digits, so the
 * value read back is exactly the value written.
 */
const spellPlainDecimal = (value: number): string => {
  const spelled = String(value);
  const at = spelled.indexOf("e");
  if (at === -1) {
    return spelled;
  }
  const exponent = Number(spelled.slice(at + 1));
  const mantissa = spelled.slice(0, at);
  const negative = mantissa.startsWith("-");
  const unsigned = negative ? mantissa.slice(1) : mantissa;
  const dot = unsigned.indexOf(".");
  const whole = dot === -1 ? unsigned : unsigned.slice(0, dot);
  const fraction = dot === -1 ? "" : unsigned.slice(dot + 1);
  const digits = `${whole}${fraction}`;
  const point = whole.length + exponent;
  const body =
    exponent < 0
      ? `0.${"0".repeat(-point)}${digits}`
      : digits.padEnd(point, "0");
  return negative ? `-${body}` : body;
};

/** One bound or text operand as the input grammar spells it. Pure. */
export default function spellOperand(operand: PredicateOperand): string {
  return typeof operand === "number"
    ? spellPlainDecimal(operand)
    : String(operand);
}
