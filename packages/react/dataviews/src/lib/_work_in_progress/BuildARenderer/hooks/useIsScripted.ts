import { useSyncExternalStore } from "react";
import type { UseIsScriptedResult } from "./types.js";

/** Nothing changes once scripts run, so there is nothing to subscribe to. */
const subscribe = (): (() => void) => () => {};

/**
 * Whether scripts have taken over the page: false on the server and while
 * hydrating, true after. A renderer reads it before it draws a control that
 * only a script can drive, so the server's markup has no dead buttons.
 */
export default function useIsScripted(): UseIsScriptedResult {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
