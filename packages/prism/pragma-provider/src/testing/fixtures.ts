/**
 * Static test data shared by this package's tests.
 *
 * Test infrastructure: excluded from the build (tsconfig.build.json) and from
 * coverage (vitest.config.ts).
 */

import type { SearchEntry } from "../lib/search/types.js";
import type { ExtractionCase, RankingCase } from "./types.js";

/** The corpus's design-system namespace, which `ds:` names. */
const DS = "https://design.example.org/ontology#";

/** A second declared namespace, so expansion is per prefix. */
const EX = "https://example.org/vocab#";

/** The prefixes reference extraction is run with: the corpus's `ds:`, plus one. */
export const EXTRACTION_PREFIXES: Readonly<Record<string, string>> = {
  ds: DS,
  ex: EX,
};

/** The cases `extractReferences` is held to, run against {@link EXTRACTION_PREFIXES}. */
export const EXTRACTION_CASES: readonly ExtractionCase[] = [
  {
    name: "expands an inline CURIE",
    markdown: "See [Button](ds:button).",
    expected: [`${DS}button`],
  },
  {
    name: "expands each CURIE against its own prefix",
    markdown: "[a](ds:button) and [b](ex:thing)",
    expected: [`${DS}button`, `${EX}thing`],
  },
  {
    name: "keeps an absolute IRI with a fragment verbatim",
    markdown: `[Button](${DS}button)`,
    expected: [`${DS}button`],
  },
  {
    name: "deduplicates one entity written as a CURIE and as an IRI",
    markdown: `[a](ds:button) then [b](${DS}button) then [c](ds:button)`,
    expected: [`${DS}button`],
  },
  {
    name: "keeps an external link as a candidate",
    markdown: "[the spec](https://www.w3.org/TR/)",
    expected: ["https://www.w3.org/TR/"],
  },
  {
    name: "ignores a link inside a code span",
    markdown: "Write `[Button](ds:button)` to link.",
    expected: [],
  },
  {
    name: "ignores a link inside a backtick fenced block",
    markdown: "```md\n[Button](ds:button)\n```\n",
    expected: [],
  },
  {
    name: "ignores a link inside a tilde fenced block",
    markdown: "~~~\n[Button](ds:button)\n~~~\n",
    expected: [],
  },
  {
    name: "ignores a link inside an indented code block",
    markdown: "Text.\n\n    [Button](ds:button)\n",
    expected: [],
  },
  {
    name: "resolves a full reference link",
    markdown: "[the button][btn]\n\n[btn]: ds:button\n",
    expected: [`${DS}button`],
  },
  {
    name: "resolves a collapsed reference link",
    markdown: "[btn][]\n\n[btn]: ds:button\n",
    expected: [`${DS}button`],
  },
  {
    name: "resolves a shortcut reference link",
    markdown: "[btn]\n\n[btn]: ds:button\n",
    expected: [`${DS}button`],
  },
  {
    name: "matches reference labels case-insensitively",
    markdown: "[the button][BTN]\n\n[btn]: ds:button\n",
    expected: [`${DS}button`],
  },
  {
    name: "resolves a definition placed after its use",
    markdown: "Before: [btn].\n\nMore text.\n\n[btn]: ds:button\n",
    expected: [`${DS}button`],
  },
  {
    name: "gives a repeated label to its first definition",
    markdown: "[btn]\n\n[btn]: ds:button\n[btn]: ds:Component\n",
    expected: [`${DS}button`],
  },
  {
    name: "yields nothing for a definition nobody uses",
    markdown: "Plain text.\n\n[unused]: ds:button\n",
    expected: [],
  },
  {
    name: "keeps an undeclared prefix as written",
    markdown: "[thing](zz:thing)",
    expected: ["zz:thing"],
  },
  {
    name: "does not expand through the prototype",
    markdown: "[foo](constructor:foo)",
    expected: ["constructor:foo"],
  },
  {
    name: "drops a relative path",
    markdown: "[guide](./guide.md)",
    expected: [],
  },
  {
    name: "drops a fragment",
    markdown: "[usage](#usage)",
    expected: [],
  },
  {
    name: "drops a destination with an empty prefix",
    markdown: "[odd](:button)",
    expected: [],
  },
  {
    name: "ignores an image",
    markdown: "![Button](ds:button)",
    expected: [],
  },
  {
    name: "ignores an image reference",
    markdown: "![Button][btn]\n\n[btn]: ds:button\n",
    expected: [],
  },
  {
    name: "resolves an autolink",
    markdown: "See <ds:button>.",
    expected: [`${DS}button`],
  },
  {
    name: "ignores an escaped link",
    markdown: "\\[x](ds:button)",
    expected: [],
  },
  {
    name: "resolves a destination with a title",
    markdown: '[Button](ds:button "The button")',
    expected: [`${DS}button`],
  },
  {
    name: "drops an angle-bracket destination containing a space",
    markdown: "[Button](<ds:a button>)",
    expected: [],
  },
  {
    name: "ignores a raw HTML anchor",
    markdown: '<a href="ds:button">Button</a>',
    expected: [],
  },
  {
    name: "finds a link inside a list, a blockquote and emphasis",
    markdown:
      "- item with [a](ds:button)\n\n> quoted [b](ds:Component)\n\n*see [c](ex:thing)*\n",
    expected: [`${DS}button`, `${DS}Component`, `${EX}thing`],
  },
  {
    name: "decodes a character reference in the destination",
    markdown: "[Button](ds:butt&#111;n)",
    expected: [`${DS}button`],
  },
  {
    name: "orders references by first mention",
    markdown: "[c](ex:thing) [a](ds:button) [b](ds:Component) [a2](ds:button)",
    expected: [`${EX}thing`, `${DS}button`, `${DS}Component`],
  },
];

/**
 * A search index written so every ranking key decides at least one case:
 * a CURIE and a definition each matching earlier than a title, two titles
 * matching at different positions, two titles of different lengths, two of
 * different lengths whose title order is the reverse of their length order,
 * two of the same length that differ only in case, and two identical titles.
 * Listed out of rank order, so the order is the ranking's, not the index's.
 */
export const SEARCH_ENTRIES: readonly SearchEntry[] = [
  {
    uri: `${DS}alert`,
    title: "Alert",
    curie: "ds:alert",
    definition: "Tells the reader something happened.",
  },
  {
    uri: `${DS}alert-banner`,
    title: "Alert banner",
    curie: "ds:alert-banner",
    definition: "An alert pinned to the top of the page.",
  },
  {
    uri: `${DS}banner-group`,
    title: "Banner group",
    curie: "ds:banner-group",
    definition: null,
  },
  { uri: `${DS}banner`, title: "Banner", curie: "ds:banner", definition: null },
  {
    uri: `${DS}toast`,
    title: "Toast",
    curie: "ds:toast",
    definition: "Notice of an event that dismisses itself.",
  },
  {
    uri: `${DS}callout`,
    title: "Callout",
    curie: "ds:notice-callout",
    definition: null,
  },
  { uri: `${DS}notice`, title: "Notice", curie: "ds:notice", definition: null },
  { uri: `${DS}a-tabs`, title: "tabs", curie: "ds:a-tabs", definition: null },
  { uri: `${DS}z-tabs`, title: "Tabs", curie: "ds:z-tabs", definition: null },
  {
    uri: `${DS}chip-legacy`,
    title: "Chip",
    curie: "ds:chip-legacy",
    definition: null,
  },
  { uri: `${DS}chip`, title: "Chip", curie: "ds:chip", definition: null },
  {
    uri: `${DS}keyline`,
    title: "Keyline",
    curie: "ds:keyline",
    definition: null,
  },
  { uri: `${DS}knob`, title: "Knob", curie: "ds:knob", definition: null },
];

/** The cases `rankSearchEntries` is held to over {@link SEARCH_ENTRIES}. */
export const RANKING_CASES: readonly RankingCase[] = [
  { name: "matches nothing for empty text", text: "", expected: [] },
  { name: "matches nothing for whitespace", text: "   ", expected: [] },
  { name: "matches nothing for text no entry holds", text: "zz", expected: [] },
  {
    name: "ranks a title match, then a CURIE match, then a definition match, wherever each falls",
    text: "notice",
    expected: [`${DS}notice`, `${DS}callout`, `${DS}toast`],
  },
  {
    name: "ranks an earlier match first among titles of one length",
    text: "banner",
    expected: [`${DS}banner`, `${DS}banner-group`, `${DS}alert-banner`],
  },
  {
    name: "ranks a shorter title first among matches at one position",
    text: "alert",
    expected: [`${DS}alert`, `${DS}alert-banner`],
  },
  {
    name: "ranks a shorter title first even where it sorts later by code point",
    text: "k",
    expected: [`${DS}knob`, `${DS}keyline`],
  },
  {
    name: "orders titles of one length by code point, capitals first",
    text: "tabs",
    expected: [`${DS}z-tabs`, `${DS}a-tabs`],
  },
  {
    name: "orders identical titles by IRI",
    text: "chip",
    expected: [`${DS}chip`, `${DS}chip-legacy`],
  },
  {
    name: "ignores the case of the text",
    text: "ALERT",
    expected: [`${DS}alert`, `${DS}alert-banner`],
  },
  {
    name: "trims the text",
    text: "  alert\t",
    expected: [`${DS}alert`, `${DS}alert-banner`],
  },
];
