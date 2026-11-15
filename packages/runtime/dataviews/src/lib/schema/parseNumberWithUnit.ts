import type { NumberReading, NumberUnits } from "./types.js";

/**
 * A plain decimal — its whole digits, then any fraction digits — then
 * optionally a unit symbol after any spaces, starting with a character that
 * cannot continue the number: `1.5.2` and `16-` are no number, not a unit.
 */
const NUMBER_WITH_UNIT = /^(-?\d+)(?:\.(\d+))?(?:\s*([^\s\d.+-]\S*))?$/;

/** A positive number as its plain digits: the whole ones, then any fraction. */
const PLAIN_DECIMAL = /^(\d+)(?:\.(\d+))?$/;

/** The start of a decimal: a sign, or digits and the point, alone. */
const PARTIAL_DECIMAL = /^-?(\d+\.)?$/;

/** The number `digits` spell, scaled exactly by a unit's factor. */
const scale = (whole: string, fraction: string, factor: number): number => {
  // The typed digits and the factor's as whole numbers, multiplied, then
  // the point moved back once: exact for the integers both make, a factor
  // below one included. A factor spelled with an exponent has no plain
  // digits, and is multiplied as it is.
  const plain = PLAIN_DECIMAL.exec(String(factor));
  if (plain === null) {
    return Number(`${whole}.${fraction}`) * factor;
  }
  const [, factorWhole = "", factorFraction = ""] = plain;
  return (
    (Number(`${whole}${fraction}`) *
      Number(`${factorWhole}${factorFraction}`)) /
    10 ** (fraction.length + factorFraction.length)
  );
};

/**
 * Read typed text as a number in base units: a plain decimal, optionally
 * followed by one of the units' display symbols, matched case-insensitively
 * and multiplied by its factor, scaled from the digits typed and the
 * factor's, so `4.03 kB` at a factor of 1000 is exactly 4030. Where the
 * field has units, spaces around the text are not part of it, and text on
 * its way to a value — `16 `, `16 G`, `-`, `1.` — is incomplete rather than
 * wrong; a whole symbol the field does not have is its own reading.
 */
export default function parseNumberWithUnit(
  input: string,
  units: NumberUnits | undefined,
): NumberReading {
  const text = units === undefined ? input : input.trim();
  if (units !== undefined && PARTIAL_DECIMAL.test(text)) {
    return { kind: "incomplete" };
  }
  const read = NUMBER_WITH_UNIT.exec(text);
  if (read === null) {
    return { kind: "not-a-number" };
  }
  const [, whole = "", fraction = "", symbol] = read;
  if (symbol === undefined) {
    // A space after the digits, where the field has units: a unit is next.
    return units !== undefined && input.trimEnd() !== input
      ? { kind: "incomplete" }
      : { kind: "value", value: Number(`${whole}.${fraction}`) };
  }
  if (units === undefined) {
    return { kind: "not-a-number" };
  }
  const folded = symbol.toLowerCase();
  const unit = units.display.find(
    (candidate) => candidate.symbol.toLowerCase() === folded,
  );
  if (unit !== undefined) {
    return { kind: "value", value: scale(whole, fraction, unit.factor) };
  }
  return units.display.some((candidate) =>
    candidate.symbol.toLowerCase().startsWith(folded),
  )
    ? { kind: "incomplete" }
    : {
        kind: "unknown-unit",
        symbol,
        accepted: units.display.map((candidate) => candidate.symbol),
      };
}
