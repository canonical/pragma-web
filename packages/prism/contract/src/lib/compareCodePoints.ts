/**
 * Lift a UTF-16 code unit so that comparing lifted units orders strings by
 * code point: surrogates (astral characters) move above every other unit,
 * and the units from U+E000 shift down to make room. Pure.
 */
const liftUnit = (unit: number): number =>
  unit >= 0xd800 && unit < 0xe000
    ? unit + 0x2000
    : unit >= 0xe000
      ? unit - 0x800
      : unit;

/**
 * Compare two strings by code point, as every order `statements` serves is
 * defined: locale-free, the same on every provider and the order a SPARQL
 * store gives `STR()`. Pure.
 *
 * @param a - The first string.
 * @param b - The second string.
 * @returns Negative when `a` sorts first, positive when `b` does, else 0.
 */
export default function compareCodePoints(a: string, b: string): number {
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const difference =
      liftUnit(a.charCodeAt(index)) - liftUnit(b.charCodeAt(index));
    if (difference !== 0) return difference;
  }
  return a.length - b.length;
}
