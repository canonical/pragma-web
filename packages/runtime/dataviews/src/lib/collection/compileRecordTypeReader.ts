import { compileFieldReader } from "../rows/index.js";
import type { SchemaFieldDefinition } from "../schema/index.js";
import type { Collection } from "./types.js";

/**
 * Compile the read of a row's declared record type for one collection: the
 * discriminator's value where it is one of the collection's declared type
 * names, and null otherwise — a row carrying no such name, or any row of a
 * collection declaring no types.
 *
 * Compiled once, so the discriminator's path and the declared names are
 * resolved once rather than on every row read. The one reading of a row's
 * type: the row scopes publish it per row, and the provider's record typing
 * remembers by it. Refusing a page reads the discriminator's raw value
 * instead, since the refusal quotes the value that is not a declared name.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function compileRecordTypeReader(
  collection: Pick<Collection<readonly SchemaFieldDefinition[]>, "types">,
): (row: object) => string | null {
  const { types } = collection;
  if (types === null) {
    return () => null;
  }
  const read = compileFieldReader(types.field);
  const declared = new Set(types.names);
  return (row) => {
    const value = read(row);
    return typeof value === "string" && declared.has(value) ? value : null;
  };
}
