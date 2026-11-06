import { untrack } from "svelte";
import type { ChainingManager } from "./ChainingManager.js";

/**
 * Manage a tooltip's delayed open state, supporting a short-lived "chaining" mode
 * where successive tooltips open without delay.
 *
 * The returned getter reflects whether the tooltip should currently be considered open
 * (after any applied delay). Visible tooltips register with the shared manager
 * until they close or are destroyed.
 *
 * @param getOpen - Reactive getter indicating the raw (immediate) open intent.
 * @param getDelay - Reactive getter providing the delay in milliseconds before showing.
 * @param chainingManager - Shared manager tracking whether chaining is active.
 * @returns A function that returns the (possibly delayed) open boolean.
 */
export function useDelayedOpen(
  getOpen: () => boolean,
  getDelay: () => number,
  chainingManager: ChainingManager,
) {
  let delayedOpen = $state(getOpen());

  $effect(() => {
    if (getOpen()) {
      if (chainingManager.chaining) {
        // If chaining, open immediately without delay
        delayedOpen = true;
        return;
      }

      const delayTimeout = setTimeout(() => {
        delayedOpen = true;
        // Do not rerun if delay changes, apply the new delay only to the next open change
      }, untrack(getDelay));

      return () => clearTimeout(delayTimeout);
    }

    delayedOpen = false;
  });

  $effect(() => {
    if (delayedOpen) {
      return chainingManager.acquire();
    }
  });

  return () => delayedOpen;
}
