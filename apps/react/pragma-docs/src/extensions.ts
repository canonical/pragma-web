import type { ProviderExtension } from "@canonical/prism-contract";

/**
 * The provider extensions the site's provider serves, as its committed
 * schema declares them: the site offers what reads them (Turtle reads
 * `source`, the entity page reads `statements`) only when they are here. A
 * test pins this list to the schema.
 */
export const SITE_EXTENSIONS = [
  "source",
  "statements",
  "values",
  "facetedInstances",
] as const satisfies readonly ProviderExtension[];
