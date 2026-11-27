import type { FieldBinding, FormOwner, FormValues } from "./types.js";

/**
 * Returns a field's error and blur handler from an owner, to
 * spread onto a `Field` or field component outside a `Form` with that owner.
 * The value goes through a function binding:
 *
 * ```svelte
 * <Field inputType="email" name="email" label="Email"
 *   bind:value={() => owner.values.email, (v) => owner.setValue("email", v)}
 *   {...bindField(owner, "email")} />
 * ```
 *
 * The properties are getters, so the spread stays reactive.
 * @note Pure.
 */
export default function bindField<Values extends FormValues>(
  owner: FormOwner<Values>,
  name: keyof Values & string,
): FieldBinding {
  return {
    get error() {
      return owner.getError?.(name);
    },
    onblur: () => owner.blur?.(name),
  };
}
