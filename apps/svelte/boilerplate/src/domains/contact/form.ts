// Fields are required unless `isOptional`.
export const fields = [
  { name: "email", inputType: "email", label: "email" },
  { name: "message", inputType: "textarea", label: "message" },
] as const;

export type FieldName = (typeof fields)[number]["name"];
export type Values = Record<FieldName, string>;
export type Errors = Partial<Record<FieldName, "emailError" | "messageError" | "tooLong">>;
export const maxLength = 4000;

export function decode(formData: FormData): Values {
  const text = (name: FieldName) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return { email: text("email"), message: text("message") };
}

export function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.email.length > maxLength) errors.email = "tooLong";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "emailError";
  if (values.message.length > maxLength) errors.message = "tooLong";
  else if (!values.message.trim()) errors.message = "messageError";
  return errors;
}
