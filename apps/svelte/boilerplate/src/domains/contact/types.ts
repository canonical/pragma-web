import type { fields } from "./constants";

export type FieldName = (typeof fields)[number]["name"];
export type Values = Record<FieldName, string>;
export type Errors = Partial<
  Record<FieldName, "emailError" | "messageError" | "tooLong">
>;
