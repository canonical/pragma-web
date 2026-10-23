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
  "entity.context": "{kind} in {location}",
  "list.count": "{count} {kind}",
  "list.empty": "Nothing to list.",
  "list.view.label": "View",
  "list.view.cards": "Cards",
  "list.view.rows": "Rows",
} as const;
