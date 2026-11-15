import type { MessageKey } from "../i18n/index.js";

/**
 * The glyph every ontology class's arm leads with: the published icon
 * for a blueprint, which a class is to its instances.
 */
export const CLASS_MARK_ICON = "blueprint";

/**
 * The glyph every ontology property's arm leads with: the published icon
 * for a tag, the attribute a property names on its subject.
 */
export const PROPERTY_MARK_ICON = "tag";

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

/**
 * The contract's ontology types that the package's switches render through
 * an arm of their own: the cases every switch names, which its coverage
 * test walks. A switch dispatches a `Node`, so it names only the ontology
 * types that implement `Node`: an `OntologyProperty` does not, so its arms
 * are rendered by the screens that read properties, never by a switch.
 */
export const ONTOLOGY_TYPES = {
  OntologyClass: true,
} as const;
