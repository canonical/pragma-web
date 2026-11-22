/**
 * Compare two strings by code point, as every order `statements` serves is
 * defined: locale-free, the same on every machine. Pure.
 *
 * @param a - The first string.
 * @param b - The second string.
 * @returns Negative when `a` sorts first, positive when `b` does, else 0.
 */
export default function compareCodePoints(a: string, b: string): number {
  return a === b ? 0 : a < b ? -1 : 1;
}
