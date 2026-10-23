/**
 * The lens's English catalog: every string a reader sees, by message key. A
 * value may hold `{name}` placeholders the translator fills, or be a plural
 * record whose branch the `count` value selects: the shape
 * `@canonical/i18n-core`'s `createTranslator` reads. A sentence that wraps
 * an element is still one message: the element's `{name}` placeholder marks
 * where it goes, and `Message` renders the element there, so a translation
 * may reorder the sentence around it.
 *
 * The lens's own name is not here: a site names each class it binds, and
 * passes that label to the routes, the layout and the pages.
 */
export const MESSAGES = {
  "index.loading": "Loading the entries…",
  "index.error":
    "The graph query failed. Is the graph server up? Reload to retry.",
  "index.empty": "The graph holds no entries of this class.",
  "index.noMatch": "No loaded entry matches the search.",
  "index.more": "Load more",
  "controls.search.label": "Filter entries",
  "controls.search.placeholder": "Search entries…",
  "status.count": {
    one: "{visible} of {count} entry",
    other: "{visible} of {count} entries",
  },
  "page.title.entity": "{title} — {lens}",
  "page.loading": "Loading the entry…",
  "page.error":
    "The graph query failed. Is the graph server up? Reload to retry.",
  "page.notFound": "Nothing in the graph answers to {address}.",
  "page.type": "Instance of {type}",
  "fields.heading": "Fields",
  "fields.value": "{property}, {kind} property to {range}, {cardinality}",
  "fields.empty": "The class declares no field.",
  "fields.inherited": "inherited",
  "kind.DATATYPE": "Datatype",
  "kind.OBJECT": "Object",
  "kind.ANNOTATION": "Annotation",
  "cardinality.one": "exactly one",
  "cardinality.optional": "at most one",
  "cardinality.many": "one or more",
  "cardinality.any": "any number",
  "relations.heading": "Relations",
  "relations.empty": "The class declares no relation to another entity.",
  "relations.value": "to {range}, {cardinality}",
} as const;
