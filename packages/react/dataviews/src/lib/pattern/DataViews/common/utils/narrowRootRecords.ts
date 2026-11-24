import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { assertColumnsOver } from "../../../../utils/index.js";
import type { ConnectedColumns, ContextOptions } from "../../types.js";

/**
 * Narrow a root's provider to the records of `columns`.
 *
 * @throws When the columns were declared over another collection.
 */
export default function narrowRootRecords<TRow extends object>(
  provider: ContextOptions["provider"],
  columns: ConnectedColumns<TRow, object>,
  part: string,
): DataViewsProvider<readonly SchemaFieldDefinition[], TRow> {
  assertColumnsOver(columns, provider.collection, part);
  // `TRow` is `RowRecord`, or the brand's over the collection just checked.
  return provider as unknown as DataViewsProvider<
    readonly SchemaFieldDefinition[],
    TRow
  >;
}
