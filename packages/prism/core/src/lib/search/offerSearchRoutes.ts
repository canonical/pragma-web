import type { ProviderExtension } from "@canonical/prism-contract";

/**
 * The search routes a site offers for the extensions its provider serves:
 * all of them when the provider serves `search`, none otherwise.
 */
export type OfferedSearchRoutes<
  TExtensions extends readonly ProviderExtension[],
  TRoutes,
> = "search" extends TExtensions[number] ? TRoutes : Record<never, never>;

/**
 * Offer a site's search routes to its route table only when the site's
 * provider serves the `search` extension, which their page reads.
 *
 * @param extensions - The extensions the site's provider serves.
 * @param routes - The site's search routes.
 * @returns The search routes, or no route when `search` is not served.
 */
export default function offerSearchRoutes<
  const TExtensions extends readonly ProviderExtension[],
  TRoutes extends object,
>(
  extensions: TExtensions,
  routes: TRoutes,
): OfferedSearchRoutes<TExtensions, TRoutes> {
  return (extensions.includes("search") ? routes : {}) as OfferedSearchRoutes<
    TExtensions,
    TRoutes
  >;
}
