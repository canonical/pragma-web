/**
 * Returns a value the menu relies on, and throws when it is missing.
 *
 * @param value The value.
 * @param invariant What the menu expects, for the error.
 * @returns The value, known to be present.
 */
export default function assertDefined<T>(
  value: T | null | undefined,
  invariant: string,
): T {
  if (value === null || value === undefined) {
    throw new Error(`ContextualMenu: ${invariant}`);
  }
  return value;
}
