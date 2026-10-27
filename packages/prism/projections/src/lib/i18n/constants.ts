/**
 * The package's English catalog: every string a reader sees in a
 * representation, by message key. A value may hold `{name}` placeholders the
 * translator fills, or be a plural record whose branch the `count` value
 * selects: the shape `@canonical/i18n-core`'s `createTranslator` reads. A
 * sentence that wraps an element is still one message: the element's
 * `{name}` placeholder marks where it goes, and `Message` renders the element
 * there, so a translation may reorder the sentence around it.
 */
export const MESSAGES = {
  "chip.lead": "{lead}:",
  "entity.parent": "{title} ∈ {parent}",
  "entity.subclass": "{title} ⊂ {parent}",
  "entity.context": "{kind} in {location}",
  "class.kind": "Class",
  "class.kind.abstract": "Abstract class",
  "class.abstract": "abstract",
  "class.instances": {
    one: "used in {count} instance",
    other: "used in {count} instances",
  },
  "property.kind.object": "Object property",
  "property.kind.datatype": "Datatype property",
  "property.kind.annotation": "Annotation property",
  "property.kind.other": "Property",
  "property.meta.object": "object",
  "property.meta.datatype": "datatype",
  "property.meta.annotation": "annotation",
  "property.meta.other": "property",
  "property.range": "Range",
  "property.inverse": "Inverse",
  "property.functional": "functional",
  "list.count": "{count} {kind}",
  "list.empty": "Nothing to list.",
  "list.view.label": "View",
  "list.view.cards": "Cards",
  "list.view.rows": "Rows",
} as const;
