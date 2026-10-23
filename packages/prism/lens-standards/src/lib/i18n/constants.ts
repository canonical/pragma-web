/**
 * The lens's English catalog: every string a reader sees, by message key. A
 * value may hold `{name}` placeholders the translator fills, or be a plural
 * record whose branch the `count` value selects: the shape
 * `@canonical/i18n-core`'s `createTranslator` reads. A sentence that wraps
 * an element is still one message: the element's `{name}` placeholder marks
 * where it goes, and `Message` renders the element there, so a translation
 * may reorder the sentence around it.
 */
export const MESSAGES = {
  "lens.label": "Standards",
  "page.title": "Standards",
  "page.error":
    "The graph query failed. Is the dev backend up? Reload to retry.",
  "index.loading": "Loading the standards…",
  "index.categories.label": "Categories",
  "index.empty": "No standards in the graph.",
  "index.more": "Load more",
  "reading.breadcrumb.label": "Breadcrumb",
  "reading.breadcrumb.index": "Standards",
  "reading.loading": "Loading the standard…",
  "reading.missing.title": "Standard not found",
  "reading.missing":
    "No standard found at {uri}. The standards index lists every standard the graph carries.",
  "article.class": "class: {class}",
  "article.definition.none": "No description recorded.",
} as const;
