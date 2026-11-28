import type { ContactErrors, ContactValues } from "./types.js";

/** Reads the contact fields from a submitted form. */
export function readContact(formData: FormData): ContactValues {
  const text = (name: keyof ContactValues) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  return {
    name: text("name"),
    email: text("email"),
    subject: text("subject"),
    message: text("message"),
  };
}

/**
 * Returns the catalog key of each invalid field: the email is required, as
 * the React form's `registerProps` require it.
 */
export function validateContact(values: ContactValues): ContactErrors {
  return values.email.trim() ? {} : { email: "contact.emailRequired" };
}
