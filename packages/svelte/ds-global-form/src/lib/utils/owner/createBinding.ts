import { createSubscriber } from "svelte/reactivity";
import type { BindingSource, FormOwner, FormValues } from "./types.js";

/**
 * Adapts a store that is not reactive under runes, such as TanStack Form's
 * `FormApi`, into a form owner: every read subscribes the reading effect to
 * the store, and stops when no effect reads it any more.
 * @note Pure: subscribes to the source only while an effect reads the owner.
 */
export default function createBinding<Values extends FormValues>(
  source: BindingSource<Values>,
): FormOwner<Values> {
  const track = createSubscriber((update) => source.subscribe(update));
  return {
    get values() {
      track();
      return source.getValues();
    },
    setValue: (name, value) => source.setValue(name, value),
    getError: (name) => {
      track();
      return source.getError?.(name);
    },
    blur: (name) => source.blur?.(name),
    submit: (event) => source.submit?.(event),
  };
}
