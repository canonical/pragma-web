/** Hook domain types for Filters: every hook's props and result. */
import type { Facet } from "@canonical/dataviews-core";

/** What `useSeenServerOptions` takes: the facets the latest result answered, or null. */
export type UseSeenServerOptionsProps = readonly [
  latest: Readonly<Record<string, Facet>> | null,
];

/** Each field's server options, as every facet seen while mounted listed them. */
export type UseSeenServerOptionsResult = (field: string) => readonly string[];
