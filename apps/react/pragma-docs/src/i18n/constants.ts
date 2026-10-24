/**
 * Every string the app's own shell, pages and projections show a reader, in
 * English, by key. The lens packages keep their own catalogs; these are the
 * words the site adds around them: its loading line, its colophon's
 * statement, its not-found page, and the words its projections of the
 * design-system types set around the graph's data. A value may hold
 * `{name}` placeholders the translator fills, or be a plural record whose
 * branch the `count` value selects: the shape `@canonical/i18n-core`'s
 * `createTranslator` reads.
 */
export const MESSAGES = {
  "shell.loading": "Loading…",
  "rail.caption": "design system docs",
  "rail.utilities": "Utilities",
  "rail.playground": "Playground",
  "rail.signIn": "Demo sign-in",
  "colophon.statement":
    "Pragma — the design system, documented from its knowledge graph.",
  "guides.title": "Guides",
  "guides.lands":
    "Long-form reading: foundations, setup, the analog map — prose that references entities through chips.",
  "guides.placeholder":
    "This canvas is a placeholder: the frame around it is finished, and the guides land with the reading views.",
  "guides.documentTitle": "{slug} — Guides",
  "guides.guideCopy": "Guide content for {slug}.",
  "notFound.title": "Page not found",
  "notFound.body": "The page you are looking for does not exist.",
  "block.version": "v{version}",
  "modifier.class": "Class",
  "modifier.family": "Family",
  "family.members": "Members",
  "family.modifiers": {
    one: "{count} modifier",
    other: "{count} modifiers",
  },
  "standard.category": "Category",
  "example.button": "Button",
  "example.chip": "Chip",
  "example.inlineCode": "inline code",
} as const;
