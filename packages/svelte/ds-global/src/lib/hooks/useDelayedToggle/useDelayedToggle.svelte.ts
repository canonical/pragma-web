import type { UseDelayedToggleProps, UseDelayedToggleResult } from "./types.js";

/**
 * Toggles a flag with a delay. Allows the caller to `activate()` or
 * `deactivate()` the flag; each call replaces any pending one.
 * @param getProps Reads the delays and callbacks; read on every call, so they
 * stay current.
 * @returns The flag, and functions to activate and deactivate it.
 * @note Impure: creates state and an effect; call during component
 * initialisation.
 */
export default function useDelayedToggle(
  getProps: () => UseDelayedToggleProps = () => ({}),
): UseDelayedToggleResult {
  let flag = $state(false);
  let flagTimeout: ReturnType<typeof setTimeout> | undefined;

  const replaceTimer = (newTimer?: ReturnType<typeof setTimeout>) => {
    if (flagTimeout) clearTimeout(flagTimeout);
    flagTimeout = newTimer;
  };

  const activate = (event: Event) => {
    const { activateDelay = 150, onActivate } = getProps();
    replaceTimer(
      setTimeout(() => {
        flag = true;
        onActivate?.(event);
      }, activateDelay),
    );
  };

  const deactivate = (event: Event) => {
    const { deactivateDelay = 150, onDeactivate } = getProps();
    replaceTimer(
      setTimeout(() => {
        flag = false;
        onDeactivate?.(event);
      }, deactivateDelay),
    );
  };

  // Clears a pending toggle when the owning component is destroyed, so no
  // timer fires after teardown. Tracks nothing, so it runs once.
  $effect(() => () => replaceTimer());

  return {
    get flag() {
      return flag;
    },
    activate,
    deactivate,
  };
}
