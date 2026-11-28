import type {
  Collection,
  DataViewsProvider,
  FilterHandles,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ContextOptions } from "../../types.js";

/**
 * Narrow a root's provider and filters to `collection`'s types.
 *
 * @throws When the root's provider was built over another collection.
 */
export default function narrowRootScope<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>(
  root: Pick<ContextOptions, "provider" | "filters">,
  collection: Collection<TFields, TRow>,
): {
  readonly provider: DataViewsProvider<TFields, TRow>;
  readonly filters: FilterHandles<TFields>;
} {
  if (root.provider.collection !== collection) {
    throw new Error(
      "useDataViews was passed a collection that is not the one the enclosing DataViews root's provider was built over",
    );
  }
  return {
    provider: root.provider as unknown as DataViewsProvider<TFields, TRow>,
    filters: root.filters as FilterHandles<TFields>,
  };
}
