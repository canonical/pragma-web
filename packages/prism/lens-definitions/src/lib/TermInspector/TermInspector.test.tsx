/**
 * The inspector's four states, driven through the real page over captured
 * records: the class view (ds:UIBlock), the property view
 * (ds:hasSubcomponent), the instance list (ds:Component: each instance is
 * an entity chip that links to the home the site declares for its type and
 * reads as plain text where it declares none), and the unknown-term alert
 * (null lookups synthesised onto the captured store, exactly the shape the
 * server serialises for an unknown term).
 */

import { render, screen, within } from "@testing-library/react";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  COMPONENT_TERM,
  DEFINITIONS_TEST_TIMEOUT_MS,
  PROPERTY_TERM,
  UIBLOCK_TERM,
} from "../../../testing/fixtures.js";
import patchRecords from "../../../testing/patchRecords.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";
import definitionsExplorerRecordsComponent from "../../../testing/records/definitionsExplorerRecordsComponent.js";
import definitionsExplorerRecordsProperty from "../../../testing/records/definitionsExplorerRecordsProperty.js";

const UNKNOWN_TERM = "ds:NoSuchTerm";

/** The captured store plus the null lookups an unknown term stores —
 * `/definitions/ds%3ANoSuchTerm` serialises exactly
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

const findInspector = (): HTMLElement =>
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
      createDefinitionsPage(UIBLOCK_TERM, definitionsExplorerRecords, fetchFn),
    );
    const panel = findInspector();

    expect(panel.getAttribute("aria-live")).toBe("polite");
    expect(
      within(panel).getByRole("heading", { level: 2, name: "UI Block" }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText(/category of visual or abstract entity/),
    ).toBeInTheDocument();
    // Lineage breadcrumb: self ⊂ direct parent ⊂ … ⊂ root, in order,
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
    // Properties split by provenance: a "Properties" grouping for the
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
    // Each property's definition is surfaced beneath its row. The
    // changelog property's definition is a fixture string — assert it
    // renders.
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
      createDefinitionsPage(
        PROPERTY_TERM,
        definitionsExplorerRecordsProperty,
        fetchFn,
      ),
    );
    const panel = findInspector();

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

  it("reads an instance of a type without a home as plain text", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    // The harness declares a home for ontology classes only, so the
    // captured Component instances have none and their chips read as text.
    const fetchFn = createFetchSpy();
    render(
      createDefinitionsPage(
        COMPONENT_TERM,
        definitionsExplorerRecordsComponent,
        fetchFn,
      ),
    );
    const panel = findInspector();

    expect(within(panel).queryByRole("link", { name: "Accordion" })).toBeNull();
    expect(within(panel).getByText("Accordion")).toBeInTheDocument();
    // Each chip is followed by its compact address, `_meta.curie`.
    expect(
      within(panel).getByText("ds:global.component.accordion"),
    ).toBeInTheDocument();
    // The truncation line is honest about the page size.
    expect(within(panel).getByText(/and more/)).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("links an instance through the home of its own type", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    // The chip dispatches on the instance's own type through the site's
    // homes: one instance is repointed at OntologyClass, which lives in this
    // lens, addressed by its compact address.
    const fetchFn = createFetchSpy();
    render(
      createDefinitionsPage(
        COMPONENT_TERM,
        repointAccordionTypename("OntologyClass"),
        fetchFn,
      ),
    );
    const panel = findInspector();

    expect(
      within(panel)
        .getByRole("link", { name: "Accordion" })
        .getAttribute("href"),
    ).toBe("/definitions/ds%3Aglobal.component.accordion");
    // …while its Component siblings, which have no home, stay text: this is
    // the home lookup biting, not every chip linking.
    expect(
      within(panel).queryByRole("link", { name: "Announcement" }),
    ).toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("renders the unknown-term alert (a 200 posture) without fetching", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(createDefinitionsPage(UNKNOWN_TERM, unknownTermRecords, fetchFn));

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("No term at");
    expect(alert.textContent).toContain(UNKNOWN_TERM);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("reads a class's absent label, definition and instances honestly", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(
      createDefinitionsPage(
        UIBLOCK_TERM,
        patchRecords(definitionsExplorerRecords, {
          "https://ds.canonical.com/UIBlock": {
            label: null,
            definition: null,
            instanceCount: 0,
          },
          "client:https://ds.canonical.com/UIBlock:properties:0": {
            required: true,
            singular: true,
          },
          "https://ds.canonical.com/hasVariant": {
            label: null,
            definition: null,
          },
        }),
        fetchFn,
      ),
    );
    const panel = findInspector();

    // The compact address stands in for the absent label, as the heading
    // and as the lineage's own leaf.
    expect(
      within(panel).getByRole("heading", { level: 2, name: UIBLOCK_TERM }),
    ).toBeInTheDocument();
    const lineage = within(panel).getByRole("heading", { name: "Lineage" })
      .nextElementSibling as HTMLElement;
    expect(lineage.textContent?.startsWith(UIBLOCK_TERM)).toBe(true);
    expect(within(panel).getByText("No definition recorded.")).toBeVisible();
    expect(
      within(panel).getByText("No named instances (0 recorded)."),
    ).toBeInTheDocument();
    // An unlabelled property links by its compact address, and carries both
    // cardinality notes.
    const row = within(panel)
      .getByRole("link", { name: "ds:hasVariant" })
      .closest("tr");
    expect(row?.textContent).toContain("required · singular");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("calls a class with no ancestors a root of its ontology", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      createDefinitionsPage(
        UIBLOCK_TERM,
        patchRecords(definitionsExplorerRecords, {
          "https://ds.canonical.com/UIBlock": { superclasses: { __refs: [] } },
        }),
        createFetchSpy(),
      ),
    );

    expect(
      within(findInspector()).getByText("A root of its ontology."),
    ).toBeInTheDocument();
  });

  it("states no truncation when every instance is listed", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      createDefinitionsPage(
        COMPONENT_TERM,
        patchRecords(definitionsExplorerRecordsComponent, {
          "client:https://ds.canonical.com/Component:instances(first:12):pageInfo":
            { hasNextPage: false },
        }),
        createFetchSpy(),
      ),
    );
    const panel = findInspector();

    expect(within(panel).getByText("Accordion")).toBeInTheDocument();
    expect(within(panel).queryByText(/and more/)).toBeNull();
  });

  it("reads a property's absent label, definition, domain and inverse honestly", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      createDefinitionsPage(
        PROPERTY_TERM,
        patchRecords(definitionsExplorerRecordsProperty, {
          "https://ds.canonical.com/hasSubcomponent": {
            label: null,
            definition: null,
            functional: true,
            domain: null,
            inverse: null,
          },
        }),
        createFetchSpy(),
      ),
    );
    const panel = findInspector();

    expect(
      within(panel).getByRole("heading", { level: 2, name: PROPERTY_TERM }),
    ).toBeInTheDocument();
    expect(within(panel).getByText("No definition recorded.")).toBeVisible();
    const details = within(panel)
      .getAllByRole("definition")
      .map((dd) => dd.textContent);
    expect(details).toEqual([
      "object",
      "yes",
      "ds:Subcomponent",
      "unstated",
      "none",
    ]);
  });

  it("says so when a class declares and inherits nothing, and names none of its instances", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      createDefinitionsPage(
        UIBLOCK_TERM,
        patchRecords(definitionsExplorerRecords, {
          "https://ds.canonical.com/UIBlock": {
            properties: { __refs: [] },
            instanceCount: 3,
          },
        }),
        createFetchSpy(),
      ),
    );
    const panel = findInspector();

    expect(
      within(panel).getByText("None declared on this class."),
    ).toBeInTheDocument();
    expect(
      within(panel).queryByRole("heading", { name: "Inherited" }),
    ).toBeNull();
    expect(
      within(panel).getByText(
        "No named instances (3 recorded — blank-node instances are embeddable, not standalone).",
      ),
    ).toBeInTheDocument();
  });
});
