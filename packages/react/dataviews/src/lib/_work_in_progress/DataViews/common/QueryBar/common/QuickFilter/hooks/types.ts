/** The quick filter's hook types: each hook's props and result. */

import type {
  DataViewsProvider,
  Facet,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";

/** What one field's facets are read for: the provider and the field. */
export type UseFieldFacetsProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
  readonly field: string;
};

/** One field's facets: the one answering the applied query, and the latest. */
export type UseFieldFacetsResult = {
  /** The field's facet answering the applied query; null while none does. */
  readonly answered: Facet | null;
  /** The field's facet in the latest result; null before any lists it. */
  readonly latest: Facet | null;
  /**
   * Whether facets are still on their way: no page has answered any, and
   * one is being asked for.
   */
  readonly pending: boolean;
};
