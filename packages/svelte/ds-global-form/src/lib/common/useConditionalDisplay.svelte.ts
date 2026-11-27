import { untrack } from "svelte";
import type { Condition } from "./types.js";

/**
 * Decides whether a field is shown. Outside a form with an owner the
 * condition receives an empty object and closes over the application's own
 * state. When a shown field becomes hidden, `onhide` is called so the field
 * drops its value, as React unregisters a hidden field; a field hidden from
 * the start leaves its value alone.
 * @note Impure: creates an effect; call during component initialisation.
 */
export default function useConditionalDisplay(
  readCondition: () => Condition | undefined,
  readOnHide: () => (() => void) | undefined,
): { readonly isVisible: boolean } {
  const isVisible = $derived.by(() => {
    const condition = readCondition();
    return condition ? condition({}) : true;
  });
  let wasVisible = untrack(() => isVisible);
  // Reruns only when visibility changes; the callback is untracked so the
  // effect does not depend on the value it writes.
  $effect(() => {
    const visible = isVisible;
    if (wasVisible && !visible) untrack(() => readOnHide()?.());
    wasVisible = visible;
  });
  return {
    get isVisible() {
      return isVisible;
    },
  };
}
