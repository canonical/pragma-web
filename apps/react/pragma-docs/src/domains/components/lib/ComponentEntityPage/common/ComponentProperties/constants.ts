import type { MessageKey } from "#i18n";

/** The table's columns, in order: each header's catalog key. */
export const PROPERTY_COLUMNS: readonly MessageKey[] = [
  "property.name",
  "property.type",
  "property.optional",
  "property.default",
  "property.constraints",
  "property.summary",
];
