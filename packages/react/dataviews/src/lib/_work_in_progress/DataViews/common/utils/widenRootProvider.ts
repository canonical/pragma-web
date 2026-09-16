import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { WidestProvider } from "./types.js";

/**
 * Take a provider as the widest shape, to store in a root's context.
 *
 * Every member the context's readers reach for is on every provider; what is
 * lost is only which field names its sort commands accept, which
 * `narrowRootProvider` restores for a caller that has proven the collection.
 */
export default function widenRootProvider<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
>(provider: DataViewsProvider<TFields, TRow>): WidestProvider {
  return provider as unknown as WidestProvider;
}
