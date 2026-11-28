/** The contact fields, in order. Fields are required unless `isOptional`. */
export const fields = [
  { name: "email", inputType: "email", label: "email" },
  { name: "message", inputType: "textarea", label: "message" },
] as const;

/** The longest value a contact field accepts. */
export const maxLength = 4000;
