/**
 * Static test data shared by this package's tests.
 *
 * Test infrastructure: excluded from the build (tsconfig.build.json) and from
 * coverage (vitest.config.ts).
 */

import type { ExtractionCase } from "./types.js";

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
