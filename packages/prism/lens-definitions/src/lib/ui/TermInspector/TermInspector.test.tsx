/**
 * The inspector over captured stores: the class view (ds:UIBlock), the
 * property view (ds:hasSubcomponent), the instance list (ds:Component:
 * each instance an entity chip that links to the home of its type and
 * reads as text where there is none), the overview with no term, and the
 * unknown-term alert; and each absent field read honestly.
 */

import { render, screen, within } from "@testing-library/react";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../testing/createStripHarness.js";
import {
  COMPONENT_TERM,
  DEFINITIONS_TEST_TIMEOUT_MS,
  PROPERTY_TERM,
  UIBLOCK_TERM,
} from "../../../../testing/fixtures.js";
import InspectorProbe from "../../../../testing/InspectorProbe.js";
import patchRecords from "../../../../testing/patchRecords.js";
import definitionsExplorerRecords from "../../../../testing/records/definitionsExplorerRecords.js";
import definitionsExplorerRecordsComponent from "../../../../testing/records/definitionsExplorerRecordsComponent.js";
import definitionsExplorerRecordsProperty from "../../../../testing/records/definitionsExplorerRecordsProperty.js";

const UNKNOWN_TERM = "ds:NoSuchTerm";

/** The id of the UI Block lookup's record, and of one of its parts. */
const UIBLOCK = 'client:root:ontologyClass(uri:"ds:UIBlock")';

/** The id of the Component lookup's record. */
const COMPONENT = 'client:root:ontologyClass(uri:"ds:Component")';

/** The id of the hasSubcomponent lookup's record. */
const HAS_SUBCOMPONENT =
  'client:root:ontologyProperty(uri:"ds:hasSubcomponent")';

/** The captured store plus the null lookups an unknown term stores. */
const unknownTermRecords = {
  ...definitionsExplorerRecords,
  "client:root": {
    ...(definitionsExplorerRecords["client:root"] as Record<string, unknown>),
    [`ontologyClass(uri:"${UNKNOWN_TERM}")`]: null,
    [`ontologyProperty(uri:"${UNKNOWN_TERM}")`]: null,
  },
} as unknown as RecordMap;

/** The Component store with its first instance repointed at `typename`. */
function repointFirstInstance(typename: string): RecordMap {
  const node = `${COMPONENT}:instances(first:12):edges:0:node`;
  const records = definitionsExplorerRecordsComponent as unknown as Record<
    string,
    Record<string, unknown>
  >;
  return {
    ...records,
    [node]: { ...records[node], __typename: typename },
    [`client:__type:${typename}`]: {
      __id: `client:__type:${typename}`,
      __isNode: true,
      __typename: "__TypeSchema",
    },
  } as unknown as RecordMap;
}

/** Mount the inspector over `records` at `term`. */
function renderInspector(
  term: string | undefined,
  records: RecordMap,
  fetchFn = createFetchSpy(),
): HTMLElement {
  render(
    createStripHarness(
      term === undefined
        ? "/definitions"
        : `/definitions/${encodeURIComponent(term)}`,
      records,
      fetchFn,
      <InspectorProbe className="custom-class" id="inspector" term={term} />,
    ),
  );
  return screen.getByRole("complementary", { name: "Term inspector" });
}

/** The section the label named `name` heads. */
function sectionOf(panel: HTMLElement, name: string | RegExp): HTMLElement {
  const section = within(panel)
    .getByRole("heading", { level: 3, name })
    .closest("section");
  if (section === null) throw new Error(`no section ${String(name)}`);
  return section;
}

describe("TermInspector", { timeout: DEFINITIONS_TEST_TIMEOUT_MS }, () => {
  it("shows a class in the explorer's section model, with no fetch", () => {
    const fetchFn = createFetchSpy();
    const panel = renderInspector(
      UIBLOCK_TERM,
      definitionsExplorerRecords,
      fetchFn,
    );

    expect(panel).toHaveAttribute("aria-live", "polite");
    expect(panel.className).toBe("ds term-inspector custom-class");
    expect(
      within(panel).getByRole("heading", { level: 2, name: "UI Block" }),
    ).toBeInTheDocument();
    expect(panel.querySelector(".tags")?.textContent).toBe("classabstract");
    expect(panel.querySelector(".address")?.textContent).toBe(
      "ds:UIBlock in ds",
    );
    expect(
      within(sectionOf(panel, "Definition")).getByText(
        /category of visual or abstract entity/,
      ),
    ).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("reads the lineage from the class up, every ancestor a link", () => {
    const lineage = sectionOf(
      renderInspector(UIBLOCK_TERM, definitionsExplorerRecords),
      "Lineage",
    );
    const text = lineage.textContent ?? "";
    expect(text.indexOf("UI Element")).toBeLessThan(text.indexOf("Entity"));
    expect(
      within(lineage).getByRole("link", { name: "UI Element" }),
    ).toBeInTheDocument();
    expect(
      within(lineage).queryByRole("link", { name: "UI Block" }),
    ).toBeNull();
  });

  it("lists the subclasses, the fields by where they come from, and the relations both ways", () => {
    const panel = renderInspector(UIBLOCK_TERM, definitionsExplorerRecords);
    expect(
      within(sectionOf(panel, "Subclasses")).getByRole("link", {
        name: "Component",
      }),
    ).toHaveAttribute("href", "/definitions/ds%3AComponent");

    const fields = sectionOf(panel, "Fields (9)");
    expect(
      within(fields).getByRole("link", { name: "guidelines" }),
    ).toBeInTheDocument();
    const inherited = within(fields).getByRole("heading", {
      level: 4,
      name: "Inherited from Entity",
    });
    expect(inherited.nextElementSibling?.textContent).toContain("decisionLog");
    expect(within(fields).getByText("ds:SemverString")).toBeInTheDocument();

    const relations = sectionOf(panel, /^Relations \(\d+\)$/);
    const outgoing = within(relations).getByRole("heading", {
      level: 4,
      name: "Outgoing",
    });
    expect(outgoing.nextElementSibling?.textContent).toContain(
      "hasTokenBinding→Token Binding",
    );
    const incoming = within(relations).getByRole("heading", {
      level: 4,
      name: "Incoming",
    });
    expect(incoming.nextElementSibling?.textContent).toContain(
      "hasVariant←UI Block",
    );
    expect(
      within(sectionOf(panel, "Instances")).getByText(
        "No named instances (0 recorded).",
      ),
    ).toBeInTheDocument();
  });

  it("groups inherited relations under the class they come from", () => {
    const panel = renderInspector(
      UIBLOCK_TERM,
      patchRecords(definitionsExplorerRecords, {
        [`${UIBLOCK}:properties:0`]: { inherited: true },
        [`${UIBLOCK}:properties:0:property:domain`]: {
          uri: "https://ds.canonical.com/Entity",
          label: "Entity",
        },
      }),
    );
    const relations = sectionOf(panel, /^Relations/);
    const group = within(relations).getByRole("heading", {
      level: 4,
      name: "Inherited from Entity",
    });
    expect(group.nextElementSibling?.textContent).toContain(
      "hasTokenBinding→Token Binding",
    );
  });

  it("shows a property's details, each reference a link", () => {
    const panel = renderInspector(
      PROPERTY_TERM,
      definitionsExplorerRecordsProperty,
    );
    expect(
      within(panel).getByRole("heading", { level: 2, name: "hasSubcomponent" }),
    ).toBeInTheDocument();
    expect(panel.querySelector(".tags")?.textContent).toBe("property");
    expect(
      within(panel)
        .getAllByRole("term")
        .map((key) => key.textContent),
    ).toEqual(["Kind", "Functional", "Range", "Domain", "Inverse"]);
    expect(within(panel).getByText("ds:Subcomponent")).toBeInTheDocument();
    expect(
      within(panel).getByRole("link", { name: "Component" }),
    ).toHaveAttribute("href", "/definitions/ds%3AComponent");
    expect(
      within(panel).getByRole("link", { name: "parentComponent" }),
    ).toHaveAttribute("href", "/definitions/ds%3AparentComponent");
  });

  it("reads a property's absent label, definition, domain and inverse honestly", () => {
    const panel = renderInspector(
      PROPERTY_TERM,
      patchRecords(definitionsExplorerRecordsProperty, {
        [HAS_SUBCOMPONENT]: {
          label: null,
          definition: null,
          functional: true,
          domain: null,
          inverse: null,
        },
      }),
    );
    expect(
      within(panel).getByRole("heading", { level: 2, name: PROPERTY_TERM }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText("No definition recorded."),
    ).toBeInTheDocument();
    expect(
      within(panel)
        .getAllByRole("definition")
        .map((value) => value.textContent),
    ).toEqual(["object", "yes", "ds:Subcomponent", "unstated", "none"]);
  });

  it("mentions instances as chips, as text where their type has no home", () => {
    const panel = renderInspector(
      COMPONENT_TERM,
      definitionsExplorerRecordsComponent,
    );
    const instances = sectionOf(panel, "Instances");
    expect(
      within(instances).queryByRole("link", { name: "Accordion" }),
    ).toBeNull();
    expect(within(instances).getAllByText("Accordion").length).toBeGreaterThan(
      0,
    );
    expect(
      within(instances).getByText("ds:apps_launchpad.component.accordion"),
    ).toBeInTheDocument();
    expect(within(instances).getByText(/and more/)).toBeInTheDocument();
  });

  it("links an instance through the home of its own type", () => {
    const panel = renderInspector(
      COMPONENT_TERM,
      repointFirstInstance("OntologyClass"),
    );
    const instances = sectionOf(panel, "Instances");
    expect(within(instances).getAllByRole("link")).toHaveLength(1);
  });

  it("states no truncation when every instance is listed", () => {
    const panel = renderInspector(
      COMPONENT_TERM,
      patchRecords(definitionsExplorerRecordsComponent, {
        [`${COMPONENT}:instances(first:12):pageInfo`]: { hasNextPage: false },
      }),
    );
    expect(
      within(sectionOf(panel, "Instances")).queryByText(/and more/),
    ).toBeNull();
  });

  it("reads a class's absent label, definition, ancestors and fields honestly", () => {
    const panel = renderInspector(
      UIBLOCK_TERM,
      patchRecords(definitionsExplorerRecords, {
        [UIBLOCK]: {
          uri: "https://ds.canonical.com/Unreached",
          label: null,
          definition: null,
          isAbstract: false,
          instanceCount: 3,
          superclasses: { __refs: [] },
          subclasses: { __refs: [] },
          properties: { __refs: [] },
        },
      }),
    );
    expect(
      within(panel).getByRole("heading", { level: 2, name: UIBLOCK_TERM }),
    ).toBeInTheDocument();
    expect(panel.querySelector(".tags")?.textContent).toBe("class");
    expect(
      within(panel).getByText("A root of its ontology."),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText("No definition recorded."),
    ).toBeInTheDocument();
    expect(within(panel).getByText("None.")).toBeInTheDocument();
    expect(within(panel).getByText("No fields.")).toBeInTheDocument();
    expect(within(panel).getByText("No relations.")).toBeInTheDocument();
    expect(
      within(panel).getByText(
        "No named instances (3 recorded — blank-node instances are embeddable, not standalone).",
      ),
    ).toBeInTheDocument();
  });

  it("reads an absent label as the address in the lineage, and an inherited field's absent domain", () => {
    const panel = renderInspector(
      UIBLOCK_TERM,
      patchRecords(definitionsExplorerRecords, {
        [UIBLOCK]: { label: null },
        [`${UIBLOCK}:properties:15:property`]: { domain: null },
      }),
    );
    expect(sectionOf(panel, "Lineage").textContent).toMatch(
      /^Lineageds:UIBlock ⊂ UI Element/,
    );
    const fields = sectionOf(panel, /^Fields/);
    expect(within(fields).getAllByRole("heading", { level: 4 })).toHaveLength(
      2,
    );
  });

  it("reads a field's absent label as its address, with both of its notes", () => {
    const panel = renderInspector(
      UIBLOCK_TERM,
      patchRecords(definitionsExplorerRecords, {
        [`${UIBLOCK}:properties:10`]: { required: true, singular: true },
        [`${UIBLOCK}:properties:10:property`]: {
          label: null,
          definition: null,
        },
      }),
    );
    const row = within(panel)
      .getByRole("link", { name: "ds:guidelines" })
      .closest("li");
    expect(row?.querySelector(".notes")?.textContent).toBe(
      "required · singular",
    );
    expect(row?.querySelector(".definition")).toBeNull();
  });

  it("reads an incoming relation with no stated domain", () => {
    const panel = renderInspector(
      UIBLOCK_TERM,
      patchRecords(definitionsExplorerRecords, {
        "client:root:ontologies:0:properties:0": { domain: null },
      }),
    );
    expect(sectionOf(panel, /^Relations/).textContent).toContain(
      "viaBlock←unstated",
    );
  });

  it("shows the graph's overview with no term", () => {
    const panel = renderInspector(undefined, definitionsExplorerRecords);
    expect(
      within(panel).getByRole("heading", { name: "Reading the graph" }),
    ).toBeInTheDocument();
  });

  it("alerts on a term the graph does not know, without fetching", () => {
    const fetchFn = createFetchSpy();
    renderInspector(UNKNOWN_TERM, unknownTermRecords, fetchFn);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe(
      `No term at ${UNKNOWN_TERM}. The rail lists every term the ontologies carry.`,
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
