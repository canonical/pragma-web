import { FIELD_PATH_DELIMITER } from "./constants.js";

/**
 * Compile the read of one field of a row record, by name or by dot path,
 * into a function of the row. Rows are constrained to `object` rather than
 * an index signature, so the read is expressed here once instead of at every
 * call site; and a path is split once, where the reader is compiled, rather
 * than on every read of every row a filter, an ordering or a facet passes
 * over.
 *
 * Own properties only, at every segment: a field naming `constructor`,
 * `toString` or any other inherited member reads nothing, rather than a
 * value the record never carried.
 *
 * A field of a nested record is named by its dot path — `config.region` —
 * and is read one own property at a time. A segment that is absent, or whose
 * value is not something a property can be read from, reads as empty: the
 * same answer a missing flat field gives, so a nested field needs no state
 * of its own. A record whose own key holds a literal dot is therefore not
 * addressable by path, and an adapter maps such a key to a stable name
 * instead.
 *
 * One read for the row model, for the record typing and for a source's
 * default field reader, so all of them read a row the same way.
 */
export default function compileFieldReader(
  field: string,
): (row: object) => unknown {
  // Most fields of most collections are flat, and read without a walk.
  if (!field.includes(FIELD_PATH_DELIMITER)) {
    return (row) =>
      Object.hasOwn(row, field)
        ? (row as Record<string, unknown>)[field]
        : undefined;
  }
  const segments = field.split(FIELD_PATH_DELIMITER);
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
