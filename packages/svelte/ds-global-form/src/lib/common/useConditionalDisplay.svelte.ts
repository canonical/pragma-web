import { untrack } from "svelte";
import { getFormOwnerContext } from "../utils/owner/formOwnerContext.js";
import type { Condition } from "./types.js";

/**
 * Decides whether a field is shown. The condition receives the enclosing form
 * owner's values; outside a form with an owner it receives an empty object and
 * closes over the application's own state. When a shown field becomes hidden, `onhide` is called so the field
 * drops its value, as React unregisters a hidden field; a field hidden from
 * the start leaves its value alone.
 * @note Impure: reads component context and creates an effect; call during
 * component initialisation.
 */
export default function useConditionalDisplay(
  readCondition: () => Condition | undefined,
  readOnHide: () => (() => void) | undefined,
): { readonly isVisible: boolean } {
  const readOwner = getFormOwnerContext();
  const isVisible = $derived.by(() => {
    const condition = readCondition();
    return condition ? condition(readOwner()?.values ?? {}) : true;
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
