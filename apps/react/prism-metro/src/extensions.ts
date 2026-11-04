import type { ProviderExtension } from "@canonical/prism-contract";

/**
 * The provider extensions the site's provider serves, as its committed
 * schema declares them: the site offers what reads them (Turtle reads
 * `source`) only when they are here. A test pins this list to the schema.
 */
export const SITE_EXTENSIONS = [
  "prose",
  "search",
  "source",
] as const satisfies readonly ProviderExtension[];
