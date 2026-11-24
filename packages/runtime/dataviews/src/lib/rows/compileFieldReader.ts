/**
 * Compile a reader of one field, by name or dot path, over own properties;
 * an absent segment reads undefined.
 */
export default function compileFieldReader(
  field: string,
): (row: object) => unknown {
  // Most fields are flat, and read without a walk.
  if (!field.includes(".")) {
    return (row) =>
      Object.hasOwn(row, field)
        ? (row as Record<string, unknown>)[field]
        : undefined;
  }
  const segments = field.split(".");
  return (row) => {
    let value: unknown = row;
    for (const segment of segments) {
      if (
        value === null ||
        (typeof value !== "object" && typeof value !== "function") ||
        !Object.hasOwn(value, segment)
      ) {
        return undefined;
      }
      value = (value as Record<string, unknown>)[segment];
    }
    return value;
  };
}
