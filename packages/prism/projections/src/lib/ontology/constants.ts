import type { MessageKey } from "../i18n/index.js";

/**
 * The catalog key of each property kind's label, the kind a property's
 * card, command and graph node name it by. A kind the contract adds later
 * has none, and reads `property.kind.other`.
 */
export const PROPERTY_KIND_LABELS: Readonly<
  Partial<Record<string, MessageKey>>
> = {
  OBJECT: "property.kind.object",
  DATATYPE: "property.kind.datatype",
  ANNOTATION: "property.kind.annotation",
};

/**
 * The catalog key of each property kind's one word, the word at the end of
 * a property's row. A kind the contract adds later has none, and reads
 * `property.meta.other`.
 */
export const PROPERTY_KIND_WORDS: Readonly<
  Partial<Record<string, MessageKey>>
> = {
  OBJECT: "property.meta.object",
  DATATYPE: "property.meta.datatype",
  ANNOTATION: "property.meta.annotation",
};
