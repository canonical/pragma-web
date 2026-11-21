import type { ProviderExtension } from "@canonical/prism-contract";
import { searchRoutes } from "./routes.js";

/**
 * The search routes a site offers for the extensions its provider serves:
 * all of them when the provider serves `search`, none otherwise.
 */
export type OfferedSearchRoutes<
  TExtensions extends readonly ProviderExtension[],
> = "search" extends TExtensions[number]
  ? typeof searchRoutes
  : Record<never, never>;

/**
 * Offer the search routes to a site's route table only when the site's
 * provider serves the `search` extension, which their page reads.
 *
 * @param extensions - The extensions the site's provider serves.
 * @returns The search routes, or no route when `search` is not served.
 */
export default function offerSearchRoutes<
  const TExtensions extends readonly ProviderExtension[],
>(extensions: TExtensions): OfferedSearchRoutes<TExtensions> {
  return (
    extensions.includes("search") ? searchRoutes : {}
  ) as OfferedSearchRoutes<TExtensions>;
}
