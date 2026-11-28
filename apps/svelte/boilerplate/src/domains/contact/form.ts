import { maxLength } from "./constants";
import type { Errors, FieldName, Values } from "./types";

/** Reads the contact fields from a submitted form. */
export function decode(formData: FormData): Values {
  const text = (name: FieldName) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return { email: text("email"), message: text("message") };
}

/** Returns a message key for each invalid contact field. */
export function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.email.length > maxLength) errors.email = "tooLong";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "emailError";
  if (values.message.length > maxLength) errors.message = "tooLong";
  else if (!values.message.trim()) errors.message = "messageError";
  return errors;
}
