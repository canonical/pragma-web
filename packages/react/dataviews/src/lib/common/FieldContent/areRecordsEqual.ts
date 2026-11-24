/**
 * Whether two records hold the same own fields, each the same value by
 * `Object.is`. A record delivered again in a fresh object with nothing
 * moved is equal, so content drawing it does not draw again.
 */
export default function areRecordsEqual(a: object, b: object): boolean {
  if (a === b) {
    return true;
  }
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every(
      (key) =>
        Object.hasOwn(b, key) &&
        Object.is(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        ),
    )
  );
}
