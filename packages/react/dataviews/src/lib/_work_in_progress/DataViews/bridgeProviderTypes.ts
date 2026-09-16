/**
 * The one place a root's provider crosses between the shape its context can
 * hold and the shape its caller named.
 *
 * React context is not generic: one context object serves every collection a
 * page mounts, so the value it carries must name one provider shape, and the
 * widest is the only one every provider is. The collection's own field list
 * cannot travel through it.
 *
 * That erasure used to be bridged by an `as` at each end. It compiled only
 * while the provider's members ignored the field list; now that a sort term
 * names the collection's own fields, `DataViewsProvider` is invariant in that
 * list — a narrow provider is no longer a wide one, nor the reverse — and the
 * two conversions became the compiler's business. They are bridged here
 * instead, once, so there is one declaration to read, one reason to check and
 * one place to delete when the root's context can carry the type itself.
 *
 * What makes the narrowing sound is not the type assertion but the check at
 * its call site: `useDataViews` compares the collection it was handed against
 * `provider.collection` by reference and throws when they differ, so the
 * provider it narrows was built over that very collection and its records and
 * field names are that collection's. None of these performs that check, so
 * none is exported beyond this domain, and `narrowRootProvider` is called
 * only after it.
 */

import type {
  DataViewsProvider,
  FilterHandles,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";

/** The provider shape a root's context carries: the widest there is. */
export type WidestProvider = DataViewsProvider<
  readonly SchemaFieldDefinition[]
>;

/** The filter handles a root's context carries, at that same widest shape. */
type WidestFilters = FilterHandles<readonly SchemaFieldDefinition[]>;

/**
 * Take a provider as the widest shape, to store in a root's context.
 *
 * Every member the context's readers reach for is on every provider; what is
 * lost is only which field names its sort commands accept, which
 * {@link narrowRootProvider} restores for a caller that has proven the
 * collection.
 */
export const widenRootProvider = <
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
>(
  provider: DataViewsProvider<TFields, TRow>,
): WidestProvider => provider as unknown as WidestProvider;

/**
 * Take a root's stored provider back at the collection's own types.
 *
 * Only sound once the caller has checked that this provider was built over
 * the collection whose types it is naming: that check is the narrowing's
 * proof, and this function does not perform it.
 */
export const narrowRootProvider = <
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>(
  provider: WidestProvider,
): DataViewsProvider<TFields, TRow> =>
  provider as unknown as DataViewsProvider<TFields, TRow>;

/**
 * Take a root's stored filter handles back at the collection's own types.
 *
 * The handles are keyed by field and operator, so they are erased by the
 * context and restored by the same proof the provider is: the caller has
 * checked that the root was built over the collection it is naming.
 */
export const narrowRootFilters = <
  TFields extends readonly SchemaFieldDefinition[],
>(
  filters: WidestFilters,
): FilterHandles<TFields> => filters as unknown as FilterHandles<TFields>;
