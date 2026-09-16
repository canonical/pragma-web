import type { Applicability } from "../rows/index.js";
import type { SchemaFieldDefinition } from "../schema/index.js";
import type { Collection } from "./types.js";

/**
 * Whether a field applies to a record of the given declared type: the one
 * reading of a field's type scoping, which every renderer asks.
 *
 * A collection declaring no types has one, so every field applies to every
 * record and scoping is inert. Otherwise a field the schema does not scope —
 * or does not describe at all, as a column showing something outside the
 * schema — applies to every type, and a scoped field applies to the types it
 * names alone. A record carrying no declared type, named null, is a type no
 * scope names.
 *
 * The type is the provider's to name, through its host's `readType`: a
 * renderer watches a record's type and asks this of the type, so it reads
 * the record for nothing else.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function readApplicability(
  collection: Pick<
    Collection<readonly SchemaFieldDefinition[]>,
    "schema" | "types"
  >,
  field: string,
  type: string | null,
): Applicability {
  if (collection.types === null) {
    return "applies";
  }
  const scope = collection.schema.findField(field)?.appliesTo;
  return scope === undefined || (type !== null && scope.includes(type))
    ? "applies"
    : "not-applicable";
}
