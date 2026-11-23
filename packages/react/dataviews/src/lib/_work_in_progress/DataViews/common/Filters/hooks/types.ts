/** Hook domain types for Filters: every hook's props and result. */
import type { Facet } from "@canonical/dataviews-core";

/** What `useSeenServerOptions` takes. */
export type UseSeenServerOptionsProps = {
  /** The facets the latest result answered, or null. */
  readonly latest: Readonly<Record<string, Facet>> | null;
};

/** Each field's server options, as every facet seen while mounted listed them. */
export type UseSeenServerOptionsResult = (field: string) => readonly string[];
