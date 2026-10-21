/**
 * The inspector's four states, driven through the real page over captured
 * records: the class view (ds:UIBlock), the property view
 * (ds:hasSubcomponent), the instance list (ds:Component: each instance is
 * an entity chip that links to the home the site declares for its type and
 * reads as plain text where it declares none), and the unknown-term alert
 * (null lookups synthesised onto the captured store, exactly the shape the
 * server serialises for an unknown term).
 */

import "../__fixtures__/stubReactFlowGlobals.js";
import { render, screen, within } from "@testing-library/react";
import type { FetchFunction } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { describe, expect, it, vi } from "vitest";
import definitionsExplorerRecords from "../__fixtures__/definitionsExplorerRecords.js";
import definitionsExplorerRecordsComponent from "../__fixtures__/definitionsExplorerRecordsComponent.js";
import definitionsExplorerRecordsProperty from "../__fixtures__/definitionsExplorerRecordsProperty.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  definitionsPageAt,
  PROPERTY_TERM,
  UIBLOCK_TERM,
} from "../__fixtures__/definitionsPageHarness.js";

const createFetchSpy = () =>
  vi.fn(() => new Promise<never>(() => {})) as ReturnType<typeof vi.fn> &
    FetchFunction;

const UNKNOWN_TERM = "ds:NoSuchTerm";

/** The captured store plus the null lookups an unknown term stores —
 * verified live: `/definitions/ds%3ANoSuchTerm` serialises exactly
 * `ontologyClass(uri:"…"): null` and `ontologyProperty(uri:"…"): null`
 * on `client:root`. */
const unknownTermRecords = {
  ...definitionsExplorerRecords,
  "client:root": {
    ...(definitionsExplorerRecords["client:root"] as Record<string, unknown>),
    [`ontologyClass(uri:"${UNKNOWN_TERM}")`]: null,
    [`ontologyProperty(uri:"${UNKNOWN_TERM}")`]: null,
  },
} as unknown as RecordMap;

const inspector = (): HTMLElement =>
  screen.getByRole("complementary", { name: "Term inspector" });

/**
 * The captured ds:Component store with the Accordion instance's record
 * repointed at `typename`. Its type record carries `__isNode: true`, as a
 * captured store does for every type a `Node` fragment has matched.
 */
const repointAccordionTypename = (typename: string): RecordMap => {
  const accordion = "https://ds.canonical.com/global.component.accordion";
  const records = definitionsExplorerRecordsComponent as unknown as Record<
    string,
    Record<string, unknown>
  >;
  return {
    ...records,
    [accordion]: { ...records[accordion], __typename: typename },
    [`client:__type:${typename}`]: {
      __id: `client:__type:${typename}`,
      __isNode: true,
      __typename: "__TypeSchema",
    },
  } as unknown as RecordMap;
};

describe("TermInspector", () => {
  it("renders the class view for ds:UIBlock, no fetch", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(
      definitionsPageAt(UIBLOCK_TERM, definitionsExplorerRecords, fetchFn),
    );
    const panel = inspector();

    expect(panel.getAttribute("aria-live")).toBe("polite");
    expect(
      within(panel).getByRole("heading", { level: 2, name: "UI Block" }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText(/category of visual or abstract entity/),
    ).toBeInTheDocument();
    // Lineage breadcrumb (B8): self ⊂ direct parent ⊂ … ⊂ root, in order,
    // with the ⊂ glyph between links. The self leaf is the class itself and
    // is NOT a link; the ancestors are.
    const lineage = within(panel).getByRole("heading", {
      name: "Lineage",
    }).nextElementSibling as HTMLElement;
    expect(lineage.textContent).toContain("UI Block");
    expect(lineage.textContent).toContain("⊂");
    expect(lineage.textContent).toContain("UI Element");
    expect(lineage.textContent).toContain("Entity");
    // The chain is ordered nearest-first: UI Element (direct) precedes Entity
    // (root), matching the fetched `superclasses` order.
    expect(lineage.textContent?.indexOf("UI Element")).toBeLessThan(
      lineage.textContent?.indexOf("Entity") ?? -1,
    );
    // The ancestors are real term links; the leaf is plain text (no link
    // named "UI Block" inside the lineage).
    expect(
      within(lineage).getByRole("link", { name: "UI Element" }),
    ).toBeInTheDocument();
    expect(
      within(lineage).queryByRole("link", { name: "UI Block" }),
    ).toBeNull();
    // Subclasses as term links.
    expect(
      within(panel)
        .getByRole("link", { name: "Component" })
        .getAttribute("href"),
    ).toBe("/definitions/ds%3AComponent");
    // Properties split by provenance (B7): a "Properties" grouping for the
    // class's own, an "Inherited" grouping for what it inherits — two
    // separate tables, not one table with an "inherited" note.
    expect(
      within(panel).getByRole("heading", { name: "Properties" }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole("heading", { name: "Inherited" }),
    ).toBeInTheDocument();
    const tables = within(panel).getAllByRole("table");
    expect(tables.length).toBe(2);
    // The declared table carries the class's own property and prefixed range.
    expect(within(panel).getByText("hasVariant")).toBeInTheDocument();
    expect(within(panel).getAllByText("ds:UIBlock").length).toBeGreaterThan(0);
    // B9: each property's definition is surfaced beneath its row (it was
    // fetched all along and previously dropped). The changelog property's
    // definition is a fixture string — assert it renders.
    expect(
      within(panel).getByText(
        "Links a UI Block to its dated change log entries.",
      ),
    ).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("renders the property view for ds:hasSubcomponent", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(
      definitionsPageAt(
        PROPERTY_TERM,
        definitionsExplorerRecordsProperty,
        fetchFn,
      ),
    );
    const panel = inspector();

    expect(
      within(panel).getByRole("heading", { level: 2, name: "hasSubcomponent" }),
    ).toBeInTheDocument();
    const terms = within(panel)
      .getAllByRole("term")
      .map((dt) => dt.textContent);
    // Five terms, not seven: `acceptanceCriteria` and `completionGuidance`
    // are annotation-derived fields the contract deliberately excludes, so
    // the inspector cannot ask an arbitrary provider for them.
    expect(terms).toEqual(["Kind", "Functional", "Range", "Domain", "Inverse"]);
    expect(within(panel).getByText("ds:Subcomponent")).toBeInTheDocument();
    // Domain and inverse are term links.
    expect(
      within(panel)
        .getByRole("link", { name: "Component" })
        .getAttribute("href"),
    ).toBe("/definitions/ds%3AComponent");
    expect(
      within(panel)
        .getByRole("link", { name: "parentComponent" })
        .getAttribute("href"),
    ).toBe("/definitions/ds%3AparentComponent");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("links component instances to their entity page", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(
      definitionsPageAt(
        "ds:Component",
        definitionsExplorerRecordsComponent,
        fetchFn,
      ),
    );
    const panel = inspector();

    // Component instances land on /components/<encoded curie>, the home
    // the site declares for a Component. The link TEXT is `_meta.title`,
    // which is total, and the address is `_meta.curie`, the same compact
    // form the catalog addresses this entity by.
    expect(
      within(panel)
        .getByRole("link", { name: "Accordion" })
        .getAttribute("href"),
    ).toBe("/components/ds%3Aglobal.component.accordion");
    // The truncation line is honest about the page size.
    expect(within(panel).getByText(/and more/)).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("leaves an instance of a type without a home as plain text", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    // Every instance in the captured fixture is a Component, so the inert
    // half of the chip has no live exemplar. One instance is repointed at a
    // type the site declares no home for, so "everything links" is a
    // failure this file can see.
    const fetchFn = createFetchSpy();
    render(
      definitionsPageAt(
        "ds:Component",
        repointAccordionTypename("Pattern"),
        fetchFn,
      ),
    );
    const panel = inspector();

    expect(within(panel).queryByRole("link", { name: "Accordion" })).toBeNull();
    expect(within(panel).getByText("Accordion")).toBeInTheDocument();
    // …while its Component siblings still link, so this is the home lookup
    // biting and not the whole list going flat.
    expect(
      within(panel).getByRole("link", { name: "Announcement" }),
    ).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("links an instance that is an ontology class to its Definitions page", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    // The chip dispatches on the instance's own type through the site's
    // homes: an OntologyClass lives in this lens, addressed by its compact
    // address, the same address a Component's entity page uses.
    const fetchFn = createFetchSpy();
    render(
      definitionsPageAt(
        "ds:Component",
        repointAccordionTypename("OntologyClass"),
        fetchFn,
      ),
    );
    const panel = inspector();

    expect(
      within(panel)
        .getByRole("link", { name: "Accordion" })
        .getAttribute("href"),
    ).toBe("/definitions/ds%3Aglobal.component.accordion");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("renders the unknown-term alert (a 200 posture, R4) without fetching", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(definitionsPageAt(UNKNOWN_TERM, unknownTermRecords, fetchFn));

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("No term at");
    expect(alert.textContent).toContain(UNKNOWN_TERM);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
