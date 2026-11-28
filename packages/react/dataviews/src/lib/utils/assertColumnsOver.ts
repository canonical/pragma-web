import type { Collection } from "@canonical/dataviews-core";
import readColumnRegistry from "./readColumnRegistry.js";

/**
 * Throw where `fields` came from `createColumns` over another collection
 * than the renderer's own, naming that collection by its fields. A list
 * written by hand carries no collection, and is not checked.
 *
 * @throws When the fields were declared over another collection.
 */
export default function assertColumnsOver(
  fields: readonly object[],
  collection: Pick<Collection, "schema">,
  part: string,
): void {
  const declared = readColumnRegistry().get(fields);
  if (declared !== undefined && declared !== collection) {
    const names = declared.schema.fieldNames
      .map((name) => `"${name}"`)
      .join(", ");
    throw new Error(
      `${part} was given columns declared over another collection, of fields ${names}`,
    );
  }
}
