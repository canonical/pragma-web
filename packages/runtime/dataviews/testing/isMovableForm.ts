import type { BindingForm } from "./types.js";

/**
 * Whether a binding of this form should carry its own `export`: a function,
 * a class, or a variable holding a function or a plain value.
 */
export default function isMovableForm(form: BindingForm): boolean {
  return form === "function" || form === "class" || form === "variable";
}
