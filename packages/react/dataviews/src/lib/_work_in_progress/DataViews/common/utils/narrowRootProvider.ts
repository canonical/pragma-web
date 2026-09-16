import type {
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { WidestProvider } from "./types.js";

/**
 * Take a root's stored provider back at the collection's own types.
 *
 * What makes the narrowing sound is not the type assertion but the check at
 * its call site: `useDataViews` compares the collection it was handed against
 * `provider.collection` by reference and throws when they differ, so the
 * provider it narrows was built over that very collection and its records and
 * field names are that collection's. This function does not perform that
 * check, so it is called only after it.
 */
export default function narrowRootProvider<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>(provider: WidestProvider): DataViewsProvider<TFields, TRow> {
  return provider as unknown as DataViewsProvider<TFields, TRow>;
}
