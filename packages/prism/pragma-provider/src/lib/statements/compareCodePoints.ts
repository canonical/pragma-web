/**
 * Compare two strings by code point, as every order `statements` serves is
 * defined: locale-free, the same on every provider. Pure.
 */
export const compareCodePoints = (a: string, b: string): number =>
  a === b ? 0 : a < b ? -1 : 1;
