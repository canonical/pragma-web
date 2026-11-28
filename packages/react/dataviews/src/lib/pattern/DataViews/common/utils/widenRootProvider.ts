import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ContextOptions } from "../../types.js";

/** Widen a provider to the root context's type. */
export default function widenRootProvider<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
>(provider: DataViewsProvider<TFields, TRow>): ContextOptions["provider"] {
  return provider as unknown as ContextOptions["provider"];
}
