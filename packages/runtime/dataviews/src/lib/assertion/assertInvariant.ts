/**
 * Return a value the code has proved is there, or throw: a null or
 * undefined here is a broken invariant, never a case to handle.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function assertInvariant<T>(
  value: T | null | undefined,
  message: string,
): T {
  if (value === null || value === undefined) {
    throw new Error(`invariant broken: ${message}`);
  }
  return value;
}
