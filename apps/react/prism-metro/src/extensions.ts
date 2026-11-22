import type { ProviderExtension } from "@canonical/prism-contract";
import readSearchSetting from "./readSearchSetting.js";
import selectSiteExtensions from "./selectSiteExtensions.js";

/**
 * The provider extensions the committed schema declares. A test pins this
 * list to the schema.
 */
export const SCHEMA_EXTENSIONS = [
  "source",
  "values",
  "facetedInstances",
  "search",
] as const satisfies readonly ProviderExtension[];

/**
 * The provider extensions the site's provider serves: the committed
 * schema's, without `search` when `PRISM_SEARCH` is `off`. The site offers
 * what reads them (Turtle reads `source`, the search page reads `search`)
 * only when they are here. A test pins each setting's list to the schema
 * the provider then serves.
 */
export const SITE_EXTENSIONS = selectSiteExtensions(
  SCHEMA_EXTENSIONS,
  readSearchSetting(),
);
