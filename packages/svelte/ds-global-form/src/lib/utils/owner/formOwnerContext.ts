import { getContext, setContext } from "svelte";
import type { FormOwner } from "./types.js";

const FORM_OWNER = Symbol("form owner");

/** Reads the enclosing form's owner; `undefined` outside a form with an owner. */
type OwnerAccessor = () => FormOwner | undefined;

/**
 * Provides a form's owner to the fields inside it. Pass an accessor, so a
 * replaced owner reaches the fields.
 * @note Impure: sets component context; call during component initialisation.
 */
export function setFormOwnerContext(readOwner: OwnerAccessor): void {
  setContext(FORM_OWNER, readOwner);
}

/**
 * Returns an accessor for the enclosing form's owner.
 * @note Impure: reads component context; call during component initialisation.
 */
export function getFormOwnerContext(): OwnerAccessor {
  return getContext<OwnerAccessor | undefined>(FORM_OWNER) ?? (() => undefined);
}
