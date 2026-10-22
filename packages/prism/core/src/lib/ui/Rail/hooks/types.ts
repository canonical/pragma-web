import type { RouteName } from "@canonical/router-core";
import type { RegisteredRouteMap } from "@canonical/router-react";
import type { ShortcutAllocation } from "../../../routeShortcut/index.js";

/**
 * What `useLensShortcuts` returns: the running router's shortcut allocation,
 * named through its registered route map.
 */
export type UseLensShortcutsResult = ShortcutAllocation<
  RouteName<RegisteredRouteMap>
>;
