import type {
  DataViewsProvider,
  FilterHandles,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";

/**
 * The provider shape a root's context carries: the widest there is.
 *
 * React context is not generic: one context object serves every collection a
 * page mounts, so the value it carries names one provider shape, and the
 * widest is the only one every provider is. `DataViewsProvider` is invariant
 * in its field list — a sort term names the collection's own fields — so a
 * narrow provider is not a wide one, nor the reverse, and the crossing
 * between the two is written once, by `widenRootProvider` and
 * `narrowRootProvider`.
 */
export type WidestProvider = DataViewsProvider<
  readonly SchemaFieldDefinition[]
>;

/** The filter handles a root's context carries, at that same widest shape. */
export type WidestFilters = FilterHandles<readonly SchemaFieldDefinition[]>;
