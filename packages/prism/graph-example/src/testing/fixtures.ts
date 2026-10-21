/**
 * Shared test fixtures.
 *
 * The lens variables are keyed by operation name and use metro-network IRIs
 * throughout — if a lens can only be satisfied by a pragma IRI, it is not
 * provider-neutral, and that is exactly what this gate is for. The
 * reference-extraction cases are written in the same vocabulary, for the
 * same reason.
 */

import type { ExtractionCase } from "./types.js";

/** A class every lens that looks a term up can be pointed at. */
export const SAMPLE_CLASS_URI = "metro:Station";

/**
 * An entity every lens that looks an instance up can be pointed at.
 *
 * This MUST be an IRI the dataset actually carries, and it must be
 * absolute: `node(id:)` takes the absolute IRI and nothing else, so
 * `metro:northgate` resolves to null here exactly as it would against
 * ke-graphql. The value was previously `https://metro.example/stop/…`,
 * which resolved to nothing at all after the dataset moved its instances
 * into the declared namespaces — harmless only for as long as every
 * operation that used it failed validation first, and a confusing
 * green-nulls failure the moment one of them started validating.
 */
export const SAMPLE_ENTITY_URI = "https://metro.example/onto#northgate";

/**
 * Variables for each lens operation, by operation name.
 *
 * An operation discovered without an entry here FAILS the gate rather than
 * skipping it: a lens nobody wrote variables for is a lens nobody tested.
 */
export const LENS_OPERATION_VARIABLES: Record<
  string,
  Record<string, unknown>
> = {
  DefinitionsExplorerQuery: { uri: SAMPLE_CLASS_URI, hasTerm: true },
  // `JourneysExplorerQuery` used to be listed here. Journeys is no longer a
  // core lens — an owner reclassified it as a pragma-specific add-on and it
  // now lives in `apps/react/pragma-docs/src/addons/journeys`, outside the
  // scanned set — so the gate never discovers the operation and the entry was
  // dead config. Note the direction the gate checks: it walks DISCOVERED names
  // and demands a variables entry for each, so a leftover entry here would
  // never have failed anything. It was removed because it described nothing,
  // not to make a test pass.
  //
  // The standards lens now reaches its collection through the TBox, so it
  // needs a class binding — and this is the gate's OWN binding, never the
  // app's. The app's runtime binding lives in
  // `apps/react/pragma-docs/src/lib/graphBindings`; importing it here would
  // couple the neutrality proof to the deployment it exists to be
  // independent of, and the gate would go green because the app agreed
  // with itself.
  StandardEntityQuery: { uri: SAMPLE_ENTITY_URI, classUri: SAMPLE_CLASS_URI },
  StandardsIndexQuery: {
    classUri: SAMPLE_CLASS_URI,
    count: 5,
    cursor: null,
  },
  StandardsIndexPaginationQuery: {
    classUri: SAMPLE_CLASS_URI,
    count: 5,
    cursor: null,
  },
};

/** The metro namespace, which `metro:` names. */
const METRO = "https://metro.example/onto#";

/** The geography namespace, so expansion is per prefix. */
const GEO = "https://geo.example/onto#";

/** The prefixes reference extraction is run with: the dataset's two namespaces. */
export const EXTRACTION_PREFIXES: Readonly<Record<string, string>> = {
  metro: METRO,
  geo: GEO,
};

/** The cases `extractReferences` is held to, run against {@link EXTRACTION_PREFIXES}. */
export const EXTRACTION_CASES: readonly ExtractionCase[] = [
  {
    name: "expands an inline CURIE",
    markdown: "See [Northgate](metro:northgate).",
    expected: [`${METRO}northgate`],
  },
  {
    name: "expands each CURIE against its own prefix",
    markdown: "[a](metro:northgate) and [b](geo:central-zone)",
    expected: [`${METRO}northgate`, `${GEO}central-zone`],
  },
  {
    name: "keeps an absolute IRI with a fragment verbatim",
    markdown: `[Northgate](${METRO}northgate)`,
    expected: [`${METRO}northgate`],
  },
  {
    name: "deduplicates one entity written as a CURIE and as an IRI",
    markdown: `[a](metro:northgate) then [b](${METRO}northgate) then [c](metro:northgate)`,
    expected: [`${METRO}northgate`],
  },
  {
    name: "keeps an external link as a candidate",
    markdown: "[the spec](https://www.w3.org/TR/)",
    expected: ["https://www.w3.org/TR/"],
  },
  {
    name: "ignores a link inside a code span",
    markdown: "Write `[Northgate](metro:northgate)` to link.",
    expected: [],
  },
  {
    name: "ignores a link inside a backtick fenced block",
    markdown: "```md\n[Northgate](metro:northgate)\n```\n",
    expected: [],
  },
  {
    name: "ignores a link inside a tilde fenced block",
    markdown: "~~~\n[Northgate](metro:northgate)\n~~~\n",
    expected: [],
  },
  {
    name: "ignores a link inside an indented code block",
    markdown: "Text.\n\n    [Northgate](metro:northgate)\n",
    expected: [],
  },
  {
    name: "resolves a full reference link",
    markdown: "[the terminus][stn]\n\n[stn]: metro:northgate\n",
    expected: [`${METRO}northgate`],
  },
  {
    name: "resolves a collapsed reference link",
    markdown: "[stn][]\n\n[stn]: metro:northgate\n",
    expected: [`${METRO}northgate`],
  },
  {
    name: "resolves a shortcut reference link",
    markdown: "[stn]\n\n[stn]: metro:northgate\n",
    expected: [`${METRO}northgate`],
  },
  {
    name: "matches reference labels case-insensitively",
    markdown: "[the terminus][STN]\n\n[stn]: metro:northgate\n",
    expected: [`${METRO}northgate`],
  },
  {
    name: "resolves a definition placed after its use",
    markdown: "Before: [stn].\n\nMore text.\n\n[stn]: metro:northgate\n",
    expected: [`${METRO}northgate`],
  },
  {
    name: "gives a repeated label to its first definition",
    markdown: "[stn]\n\n[stn]: metro:northgate\n[stn]: metro:Station\n",
    expected: [`${METRO}northgate`],
  },
  {
    name: "yields nothing for a definition nobody uses",
    markdown: "Plain text.\n\n[unused]: metro:northgate\n",
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
    markdown: "[odd](:northgate)",
    expected: [],
  },
  {
    name: "ignores an image",
    markdown: "![Northgate](metro:northgate)",
    expected: [],
  },
  {
    name: "ignores an image reference",
    markdown: "![Northgate][stn]\n\n[stn]: metro:northgate\n",
    expected: [],
  },
  {
    name: "resolves an autolink",
    markdown: "See <metro:northgate>.",
    expected: [`${METRO}northgate`],
  },
  {
    name: "ignores an escaped link",
    markdown: "\\[x](metro:northgate)",
    expected: [],
  },
  {
    name: "resolves a destination with a title",
    markdown: '[Northgate](metro:northgate "The terminus")',
    expected: [`${METRO}northgate`],
  },
  {
    name: "drops an angle-bracket destination containing a space",
    markdown: "[Northgate](<metro:a station>)",
    expected: [],
  },
  {
    name: "ignores a raw HTML anchor",
    markdown: '<a href="metro:northgate">Button</a>',
    expected: [],
  },
  {
    name: "finds a link inside a list, a blockquote and emphasis",
    markdown:
      "- item with [a](metro:northgate)\n\n> quoted [b](metro:Station)\n\n*see [c](geo:central-zone)*\n",
    expected: [`${METRO}northgate`, `${METRO}Station`, `${GEO}central-zone`],
  },
  {
    name: "decodes a character reference in the destination",
    markdown: "[Northgate](metro:northg&#97;te)",
    expected: [`${METRO}northgate`],
  },
  {
    name: "orders references by first mention",
    markdown:
      "[c](geo:central-zone) [a](metro:northgate) [b](metro:Station) [a2](metro:northgate)",
    expected: [`${GEO}central-zone`, `${METRO}northgate`, `${METRO}Station`],
  },
];
