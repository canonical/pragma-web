// @vitest-environment node

/**
 * Every lens layout, rendered through the real SSR entry: each measured URL
 * (every lens, an entity page per lens, and the guide, playground, account
 * and login pages) renders inside its own layout, and each layout carries
 * exactly one rail, one strip, one canvas and one footer.
 *
 * Method. Render `EntryServer`'s tree (static router, Relay environment, the
 * `<html>` document) to a string per URL — node environment, so
 * `renderToString` walks the exact SSR branch production walks. Data-bearing
 * pages render from their captured fixture records (the `initialData` a dev
 * server embeds), so every canvas is real content. Each body is split at the
 * single `<main data-region="canvas">`: CANVAS = its children, CHROME =
 * everything else. Then, per URL:
 *
 *   1. each region renders exactly once, in document order;
 *   2. every canvas is distinct (each URL renders its own page), and sits
 *      inside the layout its route is grouped under, named by the layout
 *      root's class;
 *   3. `aria-current` sits exactly where the per-URL model says (the rail's
 *      exact-match link, plus the breadcrumb's current crumb);
 *   4. the strip's `context`, `controls` and `status` slots carry exactly
 *      what the URL's lens layout puts there, asserted on the raw markup.
 *
 * The status figure carries a live count off the graph, so the strip's
 * controls and status are asserted STRUCTURALLY (which tenant fills the
 * slot), never as pinned strings. The breadcrumb trail is URL-derived (the
 * lens name + the route param), so it is pinned in full.
 *
 * Head elements are outside the measurement on purpose: titles are
 * route-owned document state, not chrome.
 */

import { renderToString } from "react-dom/server";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { describe, expect, it } from "vitest";
import { EntryServer } from "#server";
import journeysExplorerRecords from "../../addons/journeys/__fixtures__/journeysExplorerRecords.js";
import journeysExplorerRecordsJob from "../../addons/journeys/__fixtures__/journeysExplorerRecordsJob.js";
import catalogRecords from "../../domains/components/__fixtures__/catalogRecords.js";
import componentEntityRecordsButton from "../../domains/components/__fixtures__/componentEntityRecordsButton.js";
import definitionsExplorerRecords from "../../domains/lenses/definitions/__fixtures__/definitionsExplorerRecords.js";
import standardEntityRecords from "../../domains/lenses/standards/__fixtures__/standardEntityRecords.js";
import standardsIndexRecords from "../../domains/lenses/standards/__fixtures__/standardsIndexRecords.js";
import { LINK_COMPONENT_URI } from "../../domains/lenses/standards/__fixtures__/standardsPageHarness.js";
import lobbyRecords from "../../domains/marketing/__fixtures__/lobbyRecords.js";
import componentProbeRecords from "../../domains/playground/__fixtures__/componentProbeRecords.js";

/** The v1 lens URLs, owner-ruled order. */
const LENS_URLS = [
  "/",
  "/components",
  "/definitions",
  "/standards",
  "/journeys",
  "/guides",
] as const;

/** The P-5 entity exemplar: a non-lens URL, rendered inside its lens's
 * layout. Exact-match linking means NO rail entry carries `aria-current`
 * here (ruling R3). */
const BUTTON_ENTITY_URL = "/components/ds%3Aglobal.component.button";

/** The P-5 definitions exemplar: the term view — a second non-lens URL,
 * and the one whose canvas carries the React Flow well's server-rendered
 * node DOM. Same R3 posture: no rail entry is exact-current here. */
const DEFINITIONS_TERM_URL = "/definitions/ds%3AUIBlock";

/** The P-5 standards exemplar: the reading page — a third non-lens URL,
 * whose canvas is layout.reading's measured prose column. Its param is
 * the entity's ABSOLUTE IRI, percent-encoded: `node(id:)` accepts nothing
 * else. Same R3 posture: no rail entry is exact-current here. */
const STANDARD_READING_URL = `/standards/${encodeURIComponent(LINK_COMPONENT_URI)}`;

/** The AV-351 journeys exemplar: the job view — a fourth non-lens URL,
 * and the second whose canvas carries a React Flow well's server-rendered
 * node DOM. Same R3 posture: no rail entry is exact-current here. */
const JOURNEYS_JOB_URL = "/journeys/sem%3A%2F%2Fdesign-system-docs%23job.l3";

/** A guide's reading page: a non-lens URL of the marketing domain that
 * renders under the Guides layout, beside the guides index. Same R3
 * posture: the rail's Guides entry is not exact-current here. */
const GUIDE_URL = "/guides/getting-started";

/** The account page, signed in through the demo guard's `?auth=1`, so the
 * page renders rather than redirecting to the login page. */
const ACCOUNT_URL = "/account?auth=1";

/** The pages that are not lenses: each renders under its layout with an
 * empty strip. */
const NON_LENS_URLS = [
  GUIDE_URL,
  "/playground",
  ACCOUNT_URL,
  "/login",
] as const;

/** Every URL the certification measures. */
const MEASURED_URLS = [
  ...LENS_URLS,
  BUTTON_ENTITY_URL,
  DEFINITIONS_TERM_URL,
  STANDARD_READING_URL,
  JOURNEYS_JOB_URL,
  ...NON_LENS_URLS,
] as const;

/** The layout each measured URL renders under, by its root's class: the
 * route table's grouping, as served. */
const EXPECTED_LAYOUT: Readonly<Record<string, string>> = {
  "/": "marketing-layout",
  "/components": "components-layout",
  "/definitions": "definitions-layout",
  "/standards": "standards-layout",
  "/journeys": "journeys-layout",
  "/guides": "guides-layout",
  [BUTTON_ENTITY_URL]: "components-layout",
  [DEFINITIONS_TERM_URL]: "definitions-layout",
  [STANDARD_READING_URL]: "standards-layout",
  [JOURNEYS_JOB_URL]: "journeys-layout",
  [GUIDE_URL]: "guides-layout",
  "/playground": "playground-layout",
  [ACCOUNT_URL]: "account-layout",
  "/login": "account-layout",
};

/** Data-bearing pages render from their captured fixture records — the
 * `initialData` a dev server would embed — so canvases are real content. */
const PAGE_RECORDS: Readonly<Record<string, RecordMap>> = {
  // The Home lobby (AV-350): the front door now reads the graph too, so
  // its canvas renders from a captured fixture like every other
  // data-bearing page.
  "/": lobbyRecords,
  "/components": catalogRecords,
  [BUTTON_ENTITY_URL]: componentEntityRecordsButton,
  // Definitions rows: the explorer (no term) reads only `ontologies`,
  // which the captured term fixture carries — one fixture, both
  // definitions addresses.
  "/definitions": definitionsExplorerRecords,
  [DEFINITIONS_TERM_URL]: definitionsExplorerRecords,
  // Standards rows (P-5): the grouped index and the reading page from
  // their hand-written-then-Relay-normalised fixtures (the `cs:` package
  // is not present in this environment, so neither can be captured).
  "/standards": standardsIndexRecords,
  [STANDARD_READING_URL]: standardEntityRecords,
  // Journeys rows (AV-351): the same operation at both addresses, but
  // the selected address's store carries one extra root field
  // (`job(uri: …)`) that the @include(if: $hasJob) arm adds — so each
  // address replays its OWN verbatim capture.
  "/journeys": journeysExplorerRecords,
  [JOURNEYS_JOB_URL]: journeysExplorerRecordsJob,
  // The playground's probe, at the variables its warm step requests.
  "/playground": componentProbeRecords,
};

/** Per-URL expectation for the rail: the hrefs
 * carrying `aria-current="page"`. Home has two — the brand link and the
 * Home lens entry both point at "/". The entity URL has NONE: the rail's
 * Components entry is an exact-match link (R3). */
const EXPECTED_ARIA_CURRENT: Readonly<Record<string, readonly string[]>> = {
  // Two carriers, deliberately: the router marks BOTH same-destination links
  // exact-match on "/", so screen readers announce current-page twice on
  // Home. Assessed LOW-2 in the P-4.1 review and kept as-modelled; the fix,
  // if it ever bothers, is suppressing aria-current on the brand link.
  "/": ["/", "/"],
  "/components": ["/components"],
  "/definitions": ["/definitions"],
  "/standards": ["/standards"],
  "/journeys": ["/journeys"],
  "/guides": ["/guides"],
  [BUTTON_ENTITY_URL]: [],
  // Exact-match linking (R3): the rail's Definitions entry is NOT current
  // at a term URL. The term links that ARE current live in the canvas
  // (rail item + well node), outside the chrome measured here.
  [DEFINITIONS_TERM_URL]: [],
  // Same R3 posture: the rail's Standards entry is NOT current at a
  // reading URL.
  [STANDARD_READING_URL]: [],
  // …and the rail's Journeys entry is NOT current at a job URL.
  [JOURNEYS_JOB_URL]: [],
  // …nor its Guides entry at a guide.
  [GUIDE_URL]: [],
  // The rail's foot links the playground and the demo sign-in
  // (`/account?auth=1`), each exact-current at its own address; the login
  // page has no rail link.
  "/playground": ["/playground"],
  [ACCOUNT_URL]: [ACCOUNT_URL],
  "/login": [],
};

/**
 * Per-URL expectation for the mode strip's `data-slot="context"` MARKUP:
 * the DS `Breadcrumbs` trail to the current page, which every lens layout
 * but the stubs' renders there.
 *
 * The trail is URL-DERIVED, which is exactly why this can be pinned without
 * pinning a graph count: an INDEX page is one current crumb (the lens name);
 * an ENTITY page is the lens crumb (a router link back to the index) plus
 * the current crumb, whose text is the ROUTE PARAM (a prefixed URI/slug),
 * not a fetched display name — so the assertion stays stable across ontology
 * edits, and a wrong trail (or a stub suddenly rendering one) fails here.
 * `/guides` renders under `GuidesLayout`, whose context slot is empty.
 */

/** Build the exact breadcrumb markup a `LensBreadcrumbs` renders in the
 * strip. An `entity` present ⇒ the ENTITY shape (linked lens crumb + current
 * terminal crumb); absent ⇒ the INDEX shape (the lens crumb IS current). */
const trail = (
  lensLabel: string,
  entity?: { readonly lensHref: string; readonly current: string },
): string => {
  const nav = (inner: string): string =>
    `<nav class="ds breadcrumbs ds lens-breadcrumbs" aria-label="Breadcrumb"><ol class="list p">${inner}</ol></nav>`;
  const sep = '<span class="separator" aria-hidden="true">/</span>';
  const currentCrumb = (label: string): string =>
    `<li class="ds breadcrumbs-item current">${sep}<span class="link" aria-current="page">${label}</span></li>`;
  if (entity === undefined) return nav(currentCrumb(lensLabel));
  const linkCrumb = `<li class="ds breadcrumbs-item">${sep}<a class="link" href="${entity.lensHref}">${lensLabel}</a></li>`;
  return nav(linkCrumb + currentCrumb(entity.current));
};

const EXPECTED_STRIP_CONTEXT: Readonly<Record<string, string>> = {
  // The lobby shows its lens name too (AV-350) — "Home", exactly as the
  // lens declaration labels it; on its single address it is one current
  // crumb. Only `/guides` (still a stub) shows nothing.
  "/": trail("Home"),
  "/components": trail("Components"),
  "/definitions": trail("Definitions"),
  "/standards": trail("Standards"),
  "/journeys": trail("Journeys"),
  "/guides": "",
  // Entity pages: the lens crumb links back to the index, the terminal
  // crumb is the ROUTE PARAM (percent-decoded), never a live display name.
  [BUTTON_ENTITY_URL]: trail("Components", {
    lensHref: "/components",
    current: "ds:global.component.button",
  }),
  [DEFINITIONS_TERM_URL]: trail("Definitions", {
    lensHref: "/definitions",
    current: "ds:UIBlock",
  }),
  [STANDARD_READING_URL]: trail("Standards", {
    lensHref: "/standards",
    current: LINK_COMPONENT_URI,
  }),
  [JOURNEYS_JOB_URL]: trail("Journeys", {
    lensHref: "/journeys",
    current: "sem://design-system-docs#job.l3",
  }),
  // The guide page renders under the Guides layout, the playground and the
  // account pages under their own: every one of them leaves the trail out.
  ...Object.fromEntries(NON_LENS_URLS.map((url) => [url, ""])),
};

/** Per-URL count of `aria-current="page"` carried INSIDE the strip context
 * slot: the breadcrumb trail's terminal (current) crumb carries exactly one,
 * on every URL whose layout renders a trail — i.e. every measured URL but
 * `/guides` (the lone stub with an empty context). The aria-current census
 * below adds this to the rail's anchor count, because the current crumb is a
 * `<span>`, invisible to the anchor-scoped href model but real to a total
 * count over the whole chrome. */
const STRIP_CONTEXT_ARIA_CURRENT: Readonly<Record<string, number>> = {
  "/": 1,
  "/components": 1,
  "/definitions": 1,
  "/standards": 1,
  "/journeys": 1,
  "/guides": 0,
  [BUTTON_ENTITY_URL]: 1,
  [DEFINITIONS_TERM_URL]: 1,
  [STANDARD_READING_URL]: 1,
  [JOURNEYS_JOB_URL]: 1,
  ...Object.fromEntries(NON_LENS_URLS.map((url) => [url, 0])),
};

/**
 * Per-URL expectation for the strip's `controls` and `status` slots (R5 —
 * "a toolbar and the top bar should be useful"). Only the Definitions and
 * Journeys layouts fill them; every other URL must still render both
 * sockets EMPTY, and this model is what says so.
 *
 * The slots are asserted STRUCTURALLY, never as pinned strings. The status
 * figure reports a live count off the graph, so pinning its text would make
 * this suite fail whenever the ontology gains a class — a false alarm about
 * something it does not measure. Structure ("does this slot carry the
 * toolbar / the figure, or nothing at all?") is the honest claim.
 */
const EXPECTED_STRIP_CLAIMS: Readonly<
  Record<
    string,
    {
      /** The controls slot's expected tenant: which `data-slot` marker its
       * inner markup must carry, or `false` for an empty socket. Different
       * lenses fill it with different toolbars (definitions → chips,
       * journeys → the view switch), so the claim is the marker, not a bare
       * boolean. */
      readonly controls: string | false;
      readonly status: boolean;
    }
  >
> = {
  "/": { controls: false, status: false },
  "/components": { controls: false, status: false },
  "/definitions": { controls: "explorer-controls", status: true },
  "/standards": { controls: false, status: false },
  // Journeys claims CONTEXT and CONTROLS (RULING 1). The `controls` socket
  // holds the Table ⇄ Graph view switch — the one journeys instrument that
  // is genuinely a strip toolbar: it chooses which reading the canvas shows,
  // needs no explanatory caveat, and its labels are data-independent. (The
  // lens's OTHER controls — the coordinate chooser and the persona filter —
  // stay in the rail, each needing its own explanatory text.) The `status`
  // socket stays empty — the lens has no single figure worth a live count.
  "/journeys": { controls: "journeys-view", status: false },
  "/guides": { controls: false, status: false },
  [BUTTON_ENTITY_URL]: { controls: false, status: false },
  [DEFINITIONS_TERM_URL]: { controls: "explorer-controls", status: true },
  [STANDARD_READING_URL]: { controls: false, status: false },
  // The job view claims the switch too — the view is ephemeral, not
  // URL-derived, so both journeys addresses carry the same strip tenant.
  [JOURNEYS_JOB_URL]: { controls: "journeys-view", status: false },
  ...Object.fromEntries(
    NON_LENS_URLS.map((url) => [url, { controls: false, status: false }]),
  ),
};

const renderPage = (url: string): string =>
  renderToString(
    <EntryServer
      initialData={{
        url,
        ...(PAGE_RECORDS[url]
          ? { relay: { records: PAGE_RECORDS[url] } }
          : undefined),
      }}
    />,
  );

/** Body-scoped page markup (chrome + canvas; head excluded by design). */
const extractBody = (html: string): string => {
  const start = html.indexOf("<body");
  const end = html.lastIndexOf("</body>");
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return html.slice(start, end);
};

/** Split a body into { chrome, canvas }: canvas = the children of the single
 * `<main>`; chrome = everything else, including the `<main>` open tag. */
const splitAtCanvas = (body: string): { chrome: string; canvas: string } => {
  // The canvas's structural identity must be unique for the cut to be exact.
  expect(body.split("<main").length - 1).toBe(1);
  expect(body.split("</main>").length - 1).toBe(1);
  const open = body.indexOf("<main");
  expect(body.slice(open, body.indexOf(">", open))).toContain(
    'data-region="canvas"',
  );
  const openEnd = body.indexOf(">", open);
  const close = body.lastIndexOf("</main>");
  return {
    chrome: body.slice(0, openEnd + 1) + body.slice(close),
    canvas: body.slice(openEnd + 1, close),
  };
};

/**
 * The strip's context slot, as the ModeStrip renders it. Since P-6 this
 * holds ELEMENTS — the DS `Breadcrumbs` trail — not a bare string, so the
 * content group is non-greedy across markup (like controls/status below),
 * bounded by the next slot's open tag. The pattern still pins the slot's
 * full identity (class + data-slot), so it can never latch onto a sibling.
 */
const STRIP_CONTEXT_PATTERN =
  /(<div class="context" data-slot="context">)([\s\S]*?)(<\/div><div class="controls")/;

/**
 * The controls and status slots. Like `context`, these hold ELEMENTS
 * (a chip toolbar, a status figure), so the content group is non-greedy
 * across markup rather than text-only. Each pattern still pins the slot's
 * full identity, so it can never latch onto a sibling.
 */
const STRIP_CONTROLS_PATTERN =
  /(<div class="controls" data-slot="controls">)([\s\S]*?)(<\/div><div class="status")/;
const STRIP_STATUS_PATTERN =
  /(<div class="status" data-slot="status">)([\s\S]*?)(<\/div><\/header>)/;

/**
 * A strip slot's raw inner markup: the content group (the second capture) of
 * the slot's pattern. A chrome that carries no such slot fails the test.
 */
const extractStripSlot = (chrome: string, pattern: RegExp): string => {
  const content = pattern.exec(chrome)?.at(2);
  if (content === undefined) {
    throw new Error(`chrome carries no strip slot matching ${pattern}`);
  }
  return content;
};

/** The context slot's raw markup, asserted against the per-URL model. */
const extractStripContext = (chrome: string): string =>
  extractStripSlot(chrome, STRIP_CONTEXT_PATTERN);

/** The hrefs of anchors carrying aria-current, in document order. */
const ariaCurrentHrefs = (chrome: string): string[] =>
  [...chrome.matchAll(/<a\b[^>]*>/g)]
    .flatMap((match) => match.at(0) ?? [])
    .filter((anchor) => anchor.includes('aria-current="page"'))
    .map((anchor) => /href="([^"]*)"/.exec(anchor)?.at(1) ?? "(no href)");

interface LensPage {
  readonly chrome: string;
  readonly canvas: string;
}

/** Rendered lazily inside test context so `splitAtCanvas`'s structural
 * assertions report as test failures, not collection errors. */
let pagesCache: Map<string, LensPage> | undefined;
const getPages = (): Map<string, LensPage> => {
  pagesCache ??= new Map(
    MEASURED_URLS.map((url) => [
      url,
      splitAtCanvas(extractBody(renderPage(url))),
    ]),
  );
  return pagesCache;
};

const mustGet = (url: string): LensPage => {
  const page = getPages().get(url);
  if (page === undefined) throw new Error(`no rendered page for ${url}`);
  return page;
};

/** How many times `marker` occurs in `markup`. */
const countOccurrences = (markup: string, marker: string): number =>
  markup.split(marker).length - 1;

describe("the lens layouts, rendered through the SSR entry", () => {
  it("renders every measured canvas distinctly", () => {
    const canvases = [...getPages().values()].map(({ canvas }) => canvas);
    expect(new Set(canvases).size).toBe(MEASURED_URLS.length);
    // And each canvas holds ITS page, not a fallback:
    expect(mustGet("/").canvas).toContain('id="lobby-title"');
    // The lobby canvas renders REAL projections from its fixture records:
    // an exemplar link off ds:Component and the doors band.
    expect(mustGet("/").canvas).toContain(
      'href="/components/ds%3Aglobal.component.accordion"',
    );
    expect(mustGet("/").canvas).toContain('data-slot="doors"');
    expect(mustGet("/components").canvas).toContain(
      'id="lens-components-title"',
    );
    // The catalog canvas renders REAL cards from its fixture records.
    expect(mustGet("/components").canvas).toContain("Accordion");
    expect(mustGet("/components").canvas).toContain(
      'data-region="secondary-nav"',
    );
    expect(mustGet("/definitions").canvas).toContain(
      'id="lens-definitions-title"',
    );
    // The definitions canvases render REAL explorer content from the
    // fixture records: the term canvas carries the inspector's class
    // record AND the React Flow well's server-rendered node DOM; the
    // term-less canvas carries the honest empty inspector.
    expect(mustGet("/definitions").canvas).toContain("Select a term");
    expect(mustGet(DEFINITIONS_TERM_URL).canvas).toContain(
      '<h2 id="term-inspector-title">UI Block</h2>',
    );
    expect(mustGet(DEFINITIONS_TERM_URL).canvas).toContain(
      "hierarchy-node-shell",
    );
    expect(mustGet("/standards").canvas).toContain('id="lens-standards-title"');
    // The standards canvases render REAL content from their fixture
    // records: the index carries a grouped standard link, the reading
    // canvas carries the article's identity h1 (`_meta.title`, which for a
    // standard with no asserted name is the IRI's local name) inside
    // layout.reading's prose column.
    expect(mustGet("/standards").canvas).toContain("cs:code.array.safe_access");
    expect(mustGet(STANDARD_READING_URL).canvas).toContain(
      'data-view="standard-reading"',
    );
    expect(mustGet(STANDARD_READING_URL).canvas).toContain(
      '<h1 id="standard-reading-title">react.component.link_component</h1>',
    );
    expect(mustGet(STANDARD_READING_URL).canvas).toContain(
      'data-slot="reading-canvas"',
    );
    // The journeys canvases render REAL content from the fixture records:
    // the index carries the PRIMARY-SURFACE table (AV-351). The table and
    // the graph are ONE reading at a time (RULING 1), with the TABLE as the
    // default — so the default SSR output is the table, and the well's node
    // DOM is a client transition, NOT in the served markup.
    expect(mustGet("/journeys").canvas).toContain('id="lens-journeys-title"');
    // The table is the lens's primary surface and the DEFAULT view, and it
    // SSRs: its slot, its row-header cells and its group-by control are all
    // in the served markup — the sortable data table exists before any
    // client JS.
    expect(mustGet("/journeys").canvas).toContain('data-slot="journeys-table"');
    expect(mustGet("/journeys").canvas).toContain('scope="row"');
    expect(mustGet("/journeys").canvas).toContain("Group by");
    // The view switch is NO LONGER in the canvas (RULING 1): it is the mode
    // strip's `controls` tenant now, so it lands in the CHROME, not here. The
    // strip claim is asserted by EXPECTED_STRIP_CLAIMS below; the canvas must
    // NOT carry the switch.
    expect(mustGet("/journeys").canvas).not.toContain(
      'aria-label="Journey view"',
    );
    // RULING 2: the DEFAULT (table) view drops the inspector column, so the
    // inspector region is absent from the default canvas — no empty column,
    // and no "Select a job" empty-inspector prompt in table mode.
    expect(mustGet("/journeys").canvas).not.toContain(".journey-inspector");
    expect(mustGet("/journeys").canvas).not.toContain(
      'id="journey-inspector-title"',
    );
    // HONEST: the well (react-flow node DOM) is NOT in the default output —
    // the graph is the non-default view, reached by the client switch. This
    // used to assert the node DOM was present because the well SSR'd
    // alongside the table; with one-view-at-a-time and table-default, the
    // default canvas is the table alone.
    expect(mustGet("/journeys").canvas).not.toContain("react-flow__node-hop");
    // The job canvas defaults to the table too (the view is ephemeral, not
    // URL-derived), so it carries the TABLE — not the inspector (dropped in
    // table mode, RULING 2) and not the well's node DOM (the non-default
    // view). The selected job is still in the URL; it only surfaces once the
    // reader flips to the graph.
    expect(mustGet(JOURNEYS_JOB_URL).canvas).toContain(
      'data-slot="journeys-table"',
    );
    expect(mustGet(JOURNEYS_JOB_URL).canvas).not.toContain(
      'id="journey-inspector-title"',
    );
    expect(mustGet(JOURNEYS_JOB_URL).canvas).not.toContain(
      "react-flow__node-hop",
    );
    expect(mustGet("/guides").canvas).toContain('id="lens-guides-title"');
    // The entity page renders its REAL data from the fixture records, not
    // a loading state — the whole view SSRs from a warm store.
    expect(mustGet(BUTTON_ENTITY_URL).canvas).toContain(
      'data-view="component-entity"',
    );
    expect(mustGet(BUTTON_ENTITY_URL).canvas).toContain(
      '<h1 id="component-entity-title">Button</h1>',
    );
    // The non-lens pages render their own page, not a fallback: the guide
    // its slug, the playground its probe from the warm store, and the
    // account and login pages their copy.
    expect(mustGet(GUIDE_URL).canvas).toContain(
      '<h1 id="guide-title">getting-started</h1>',
    );
    expect(mustGet("/playground").canvas).toContain('id="playground-title"');
    expect(mustGet("/playground").canvas).not.toContain("Loading the graph");
    expect(mustGet(ACCOUNT_URL).canvas).toContain('id="account-title"');
    expect(mustGet("/login").canvas).toContain('id="login-title"');
  });

  it("renders each URL inside the layout its route is grouped under", () => {
    for (const [url, { chrome }] of getPages()) {
      const layouts = [...chrome.matchAll(/class="ds ([a-z-]+-layout)"/g)].map(
        (match) => match.at(1),
      );
      expect(layouts, `layout on ${url}`).toEqual([EXPECTED_LAYOUT[url]]);
    }
  });

  it("renders each region exactly once on every URL", () => {
    for (const [url, { chrome }] of getPages()) {
      for (const marker of [
        'data-region="primary-nav"',
        'data-region="mode-strip"',
        'data-region="canvas"',
        'data-region="footer"',
        'data-slot="context"',
        'data-slot="controls"',
        'data-slot="status"',
        "Skip to content",
      ]) {
        expect(
          countOccurrences(chrome, marker),
          `${url} renders ${marker} once`,
        ).toBe(1);
      }
    }
  });

  it("renders the regions in order on every URL: skip link, rail, strip, canvas, footer", () => {
    for (const [url, { chrome }] of getPages()) {
      const positions = [
        'class="ds canvas-skip-link"',
        'data-region="primary-nav"',
        'data-region="mode-strip"',
        'data-region="canvas"',
        'data-region="footer"',
      ].map((marker) => chrome.indexOf(marker));
      expect(positions, `region order on ${url}`).toEqual(
        positions.toSorted((a, b) => a - b),
      );
      expect(positions, `every region on ${url}`).not.toContain(-1);
    }
  });

  it("places aria-current exactly as modelled, per lens", () => {
    for (const [url, { chrome }] of getPages()) {
      expect(ariaCurrentHrefs(chrome), `aria-current on ${url}`).toEqual(
        EXPECTED_ARIA_CURRENT[url],
      );
    }
  });

  it("counts every raw aria-current occurrence against the model — anchors or not", () => {
    // Blind to the carrying element: the anchor-scoped href check above
    // cannot see a stray `aria-current` on a non-anchor. This count closes
    // that gap — any extra carrier on any element breaks it.
    //
    // The total is the rail's exact-match anchors PLUS the strip
    // breadcrumb's terminal (current) crumb — a `<span aria-current="page">`
    // the anchor model above cannot see, present on every URL that claims a
    // Context (all but `/guides`). Both carriers are modelled, so an
    // unaccounted-for third would break this.
    for (const [url, { chrome }] of getPages()) {
      expect(
        (chrome.match(/aria-current="page"/g) ?? []).length,
        `raw aria-current count on ${url}`,
      ).toBe(
        EXPECTED_ARIA_CURRENT[url].length + STRIP_CONTEXT_ARIA_CURRENT[url],
      );
    }
  });

  it("carries the strip context exactly as modelled, per URL", () => {
    // A layout rendering the wrong trail (or a stub suddenly rendering one)
    // fails here.
    for (const [url, { chrome }] of getPages()) {
      expect(extractStripContext(chrome), `strip context on ${url}`).toBe(
        EXPECTED_STRIP_CONTEXT[url],
      );
    }
  });

  it("carries the strip controls and status exactly as modelled, per URL", () => {
    // A layout that wrongly fills (or wrongly leaves empty) a socket fails
    // here.
    for (const [url, { chrome }] of getPages()) {
      const expected = EXPECTED_STRIP_CLAIMS[url];
      if (expected === undefined) throw new Error(`no strip model for ${url}`);

      const controls = extractStripSlot(chrome, STRIP_CONTROLS_PATTERN);
      const status = extractStripSlot(chrome, STRIP_STATUS_PATTERN);

      if (expected.controls) {
        // Structural, not a pinned string: the toolbar is present and is the
        // real one this lens claims, identified by its own slot marker
        // (definitions → `explorer-controls`, journeys → `journeys-view`).
        expect(controls, `controls on ${url}`).toContain(
          `data-slot="${expected.controls}"`,
        );
      } else {
        expect(controls, `controls on ${url} must be empty`).toBe("");
      }

      if (expected.status) {
        expect(status, `status on ${url}`).toContain(
          'data-slot="explorer-status"',
        );
      } else {
        expect(status, `status on ${url} must be empty`).toBe("");
      }
    }
  });
});

/**
 * The 404 route (AV-334 gap #2). `notFoundRoute` is wired into every router
 * construction across six test files and was never exercised by any of
 * them.
 *
 * It is deliberately NOT a member of MEASURED_URLS. The suite above
 * measures pages rendered inside a lens layout — its `splitAtCanvas`
 * requires exactly one `<main data-region="canvas">`, which is the
 * layout's. `notFoundRoute` is declared OUTSIDE every `group(...)` in
 * routes.tsx, so it renders bare: zero `<main>`, no rail, no strip. So the
 * honest test is this one — it pins what the 404 route ACTUALLY is today,
 * including that no layout wraps it, which is the fact a future reader most
 * needs to know.
 */
describe("the not-found route renders (AV-334 gap #2)", () => {
  const body = extractBody(renderPage("/no-such-page"));

  it("renders the not-found copy for an unrouted URL", () => {
    expect(body).toContain("Page not found");
    expect(body).toContain("The page you are looking for does not exist.");
  });

  it("renders outside every lens layout — no canvas, no chrome", () => {
    // The structural claim that keeps it out of MEASURED_URLS. If the 404
    // is ever grouped under a lens layout (a reasonable future change),
    // this fails loudly and points at the decision above rather than
    // letting the suite above break mysteriously.
    expect(body.split("<main").length - 1).toBe(0);
    expect(body).not.toContain('data-region="primary-nav"');
    expect(body).not.toContain('data-region="canvas"');
  });

  it("renders content distinct from every measured lens canvas", () => {
    // The distinctness the brief asks for, stated against the real
    // structure: the 404 body matches no lens canvas.
    const canvases = [...getPages().values()].map(({ canvas }) => canvas);
    for (const canvas of canvases) {
      expect(canvas).not.toBe(body);
      expect(canvas).not.toContain("Page not found");
    }
  });
});
