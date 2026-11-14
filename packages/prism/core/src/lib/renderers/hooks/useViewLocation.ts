import type { RouterLocationState } from "@canonical/router-core";
import { useRouterState } from "@canonical/router-react";
import type { UseViewLocationResult } from "./types.js";

/** Whether two locations are the same address. */
const isSameAddress = (
  left: RouterLocationState,
  right: RouterLocationState,
): boolean => left.href === right.href;

/**
 * The current page's path and its search parameters by name, which a view
 * builds the hrefs of its other states from.
 *
 * @returns The address's path and parameters.
 * @note Impure: reads the router's location.
 */
export default function useViewLocation(): UseViewLocationResult {
  const location = useRouterState((state) => state.location, {
    isEqual: isSameAddress,
  });
  return {
    pathname: location.pathname,
    search: Object.fromEntries(location.searchParams.entries()),
  };
}
