/**
 * The value, narrowed to exclude `null` and `undefined`.
 *
 * Throws with `message` when the value is absent, so a test fails at the
 * missing value rather than reading through it.
 */
export const assertPresent = <T>(
  value: T | null | undefined,
  message: string,
): T => {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
};
