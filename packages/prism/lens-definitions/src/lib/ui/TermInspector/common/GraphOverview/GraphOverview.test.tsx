import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { useFragment } from "react-relay";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import { DEFINITIONS_TEST_TIMEOUT_MS } from "../../../../../../testing/fixtures.js";
import classEdges from "../../../../../../testing/records/classEdges.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import metroGraph from "../../../../../../testing/records/metroGraph.js";
import ontologyGraph from "../../../../../../testing/records/ontologyGraph.js";
import useCapturedExplorer from "../../../../../../testing/useCapturedExplorer.js";
import type { TermInspector_ontologies$key } from "../../../../../__generated__/TermInspector_ontologies.graphql.js";
import termInspectorOntologiesFragmentNode from "../../../../../__generated__/TermInspector_ontologies.graphql.js";
import listUndeclaredEdges from "../../../../classGraph/listUndeclaredEdges.js";
import weighStroke from "../../../../classGraph/weighStroke.js";
import { MESSAGES } from "../../../../i18n/index.js";
import { useLensFilter } from "../../../LensFilterProvider/index.js";
import { SPECIMENS, STROKE_SPECIMENS } from "./constants.js";
import GraphOverview from "./GraphOverview.js";

/** The overview over the store, beside a readout of the asked region. */
function Overview({
  edges = classEdges,
  boxed,
}: {
  readonly edges?: typeof classEdges;
  readonly boxed?: readonly string[];
}): ReactElement {
  const { data } = useCapturedExplorer();
  const ontologies = useFragment<TermInspector_ontologies$key>(
    termInspectorOntologiesFragmentNode,
    data.ontologies,
  );
  const { region } = useLensFilter();
  return (
    <>
      <output aria-label="Region">
        {region === undefined ? "all" : `${region.prefix} #${region.serial}`}
      </output>
      <GraphOverview
        boxed={boxed}
        className="custom-class"
        classEdges={edges}
        data-testid="overview"
        ontologies={ontologies}
      />
    </>
  );
}

/**
 * Mount the overview over the captured store, with its class edges and
 * the namespaces drawn as boxes, at an address of the explorer.
 */
function renderOverview(
  edges?: typeof classEdges,
  boxed?: readonly string[],
  url = "/definitions",
): HTMLElement {
  render(
    createStripHarness(
      url,
      definitionsExplorerRecords,
      createFetchSpy(),
      <Overview boxed={boxed} edges={edges} />,
    ),
  );
  return screen.getByTestId("overview");
}

describe("GraphOverview", { timeout: DEFINITIONS_TEST_TIMEOUT_MS }, () => {
  it("explains the graph with specimens drawn by the graph itself", () => {
    const overview = renderOverview();
    expect(overview.className).toBe("ds graph-overview custom-class");
    const entries = overview.querySelectorAll(".entry");
    expect(entries).toHaveLength(SPECIMENS.length + STROKE_SPECIMENS.length);
    for (const entry of entries) {
      expect(entry.querySelector("svg .ds.class-graph")).not.toBeNull();
    }
    expect(entries.item(0).textContent).toContain(
      "A concrete class with its instance count",
    );
    // The hub specimen draws its hub alone.
    expect(entries.item(2).querySelectorAll(".node")).toHaveLength(1);
  });

  it("draws its relations as specimens: the lightest solid stroke, claiming no store's weight", () => {
    const overview = renderOverview();
    const relations = [...overview.querySelectorAll(".entry")]
      .slice(0, SPECIMENS.length)
      .flatMap((entry) => [...entry.querySelectorAll("path.relation")]);
    expect(relations.length).toBeGreaterThan(0);
    for (const path of relations) {
      expect(path.getAttribute("stroke-width")).toBe("1");
      expect(path.hasAttribute("stroke-dasharray")).toBe(false);
    }
    expect(overview.querySelector("[data-weight]")).toBeNull();
  });

  it("draws a bridge between two namespaces in the strong line, named at rest", () => {
    const overview = renderOverview();
    const bridge = [...overview.querySelectorAll(".entry")].find((entry) =>
      entry.textContent?.includes("A bridge:"),
    );
    expect(bridge?.querySelector("path.relation")?.getAttribute("class")).toBe(
      "relation is-bridge",
    );
    expect(
      bridge?.querySelector("text.edge-label.is-bridge")?.textContent,
    ).toBe("predicate");
    // A specimen states a stroke, never a count.
    expect(bridge?.querySelector("[data-weight]")).toBeNull();
  });

  it("draws a namespace as one box and a class of a namespace that is not loaded, as the canvas draws them", () => {
    const overview = renderOverview();
    const entries = [...overview.querySelectorAll(".entry")];
    const region = entries.find((entry) =>
      entry.textContent?.includes("A namespace drawn as one box"),
    );
    const box = region?.querySelector('.node[data-kind="region"]');
    expect(box?.textContent).toContain("12 classes, 9 relations");
    // The specimen opens nothing: it is no link.
    expect(region?.querySelector("a")).toBeNull();
    const stub = entries.find((entry) =>
      entry.textContent?.includes("not loaded"),
    );
    expect(
      stub?.querySelector('.node[data-kind="stub"] .stub-frame'),
    ).not.toBeNull();
    expect(stub?.textContent).toContain("its relations are not counted");
    const line = stub?.querySelector("path.relation");
    expect(line?.getAttribute("class")).toBe("relation is-bridge");
    expect(line?.getAttribute("stroke-width")).toBe("1");
    expect(line?.hasAttribute("stroke-dasharray")).toBe(false);
  });

  it("shows a relation's weight in the canvas's four steps, each over the statements it stands for", () => {
    const overview = renderOverview();
    const [weight, zero] = [...overview.querySelectorAll(".entry")].slice(
      SPECIMENS.length,
    );
    const steps = [...(weight?.querySelectorAll(".stroke") ?? [])].map(
      (step) => [
        step.querySelector("path.relation")?.getAttribute("stroke-width"),
        step.querySelector(".step")?.textContent,
      ],
    );
    expect(steps).toEqual([
      ["1", "1 to 9 statements"],
      ["2", "10 to 99 statements"],
      ["4", "100 to 999 statements"],
      ["8", "1000 and more statements"],
    ]);
    // Each step's width is the one the canvas draws for its decade.
    expect(
      [
        [1, 9],
        [10, 99],
        [100, 999],
        [1000, 1_000_000],
      ].map((bounds) => [
        ...new Set(bounds.map((count) => String(weighStroke(count).width))),
      ]),
    ).toEqual(steps.map(([width]) => [width]));
    // An 8px line ends inside a head grown to 20px, as on the canvas.
    expect(
      weight
        ?.querySelector('path.relation[stroke-width="8"]')
        ?.getAttribute("d"),
    ).toBe("M0 0L40 0");
    expect(weight?.textContent).toContain(
      "heavier the more statements the graph holds",
    );
    const dashed = zero?.querySelector("path.relation");
    expect(dashed?.getAttribute("class")).toBe("relation");
    expect(dashed?.getAttribute("stroke-dasharray")).toBe("4 4");
    expect(dashed?.getAttribute("stroke-width")).toBe("1");
    expect(zero?.querySelector(".filled-head")?.getAttribute("class")).toBe(
      "filled-head",
    );
    expect(zero?.querySelector(".step")).toBeNull();
    expect(zero?.textContent).toBe("A relation with no statements yet: dashed");
  });

  it("names its specimens for their role, never after a class of a site's ontology", () => {
    const classes = new Set(
      [ontologyGraph, metroGraph].flatMap((graph) =>
        graph.classes.map((klass) => klass.label),
      ),
    );
    const labels = SPECIMENS.flatMap((specimen) =>
      specimen.classes.map((klass) => String(MESSAGES[klass.label])),
    );
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.filter((label) => classes.has(label))).toEqual([]);
    const overview = renderOverview();
    for (const title of overview.querySelectorAll(".entry .title")) {
      expect(classes.has(title.textContent ?? "")).toBe(false);
    }
  });

  it("counts each namespace's classes, instances and relations", () => {
    const overview = renderOverview();
    const buttons = within(overview).getAllByRole("button");
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Fit the graph to ds",
      "Fit the graph to cs",
      "Fit the graph to anatomy",
    ]);
    expect(buttons.at(1)?.textContent).toMatch(/^cs3 classes/);
    // The figure a namespace's box on the canvas states too.
    expect(buttons.at(0)?.textContent).toMatch(/ · 21 relations$/);
  });

  it("asks the graph to fit the namespace a reader picks, each time", () => {
    const overview = renderOverview();
    const cs = within(overview).getByRole("button", {
      name: "Fit the graph to cs",
    });
    fireEvent.click(cs);
    expect(screen.getByRole("status", { name: "Region" }).textContent).toBe(
      "cs #1",
    );
    fireEvent.click(cs);
    expect(screen.getByRole("status", { name: "Region" }).textContent).toBe(
      "cs #2",
    );
  });

  it("links a boxed namespace's row to the explorer opened on it, keeping the page's view keys, and keeps every row's fit button", () => {
    const overview = renderOverview(
      undefined,
      ["cs"],
      "/definitions?sheet=filter",
    );
    const open = within(overview).getByRole("link", { name: "Open cs" });
    const href = new URL(open.getAttribute("href") ?? "", "http://site");
    expect(href.pathname).toBe("/definitions");
    expect(href.searchParams.get("expand")).toBe("cs");
    expect(href.searchParams.get("sheet")).toBe("filter");
    // Only the boxed namespace opens; every row still fits the camera.
    expect(
      within(overview).queryAllByRole("link", { name: /^Open / }),
    ).toHaveLength(1);
    expect(within(overview).getAllByRole("button")).toHaveLength(3);
    expect(
      open
        .closest(".namespace-row")
        ?.querySelector(".namespace")
        ?.getAttribute("aria-label"),
    ).toBe("Fit the graph to cs");
  });

  it("opens no namespace from its row when the graph draws none as a box", () => {
    const overview = renderOverview();
    expect(within(overview).queryAllByRole("link", { name: /^Open / })).toEqual(
      [],
    );
  });

  it("says how to move about the graph", () => {
    const overview = renderOverview();
    expect(
      within(overview).getByRole("heading", { name: "Gestures" }),
    ).toBeInTheDocument();
  });

  it("opens on a count line whose figures link to the namespace rows that add up to them", () => {
    const root = renderOverview();
    const line = root.firstElementChild;
    expect(line?.className).toBe("count-line");
    const links = [...(line?.querySelectorAll("a.count-link") ?? [])];
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(link.getAttribute("href")).toBe("#graph-overview-namespaces");
    }
    const rows = root.querySelectorAll("#graph-overview-namespaces .namespace");
    expect(links.at(1)?.textContent).toBe(`${rows.length} namespaces`);
    const sum = (index: number): number =>
      [...rows].reduce(
        (total, row) =>
          total +
          Number(
            row
              .querySelector(".figures")
              ?.textContent?.split(" · ")
              .at(index)
              ?.split(" ")
              .at(0),
          ),
        0,
      );
    expect(links.at(0)?.textContent).toBe(`${sum(0)} classes`);
    expect(links.at(2)?.textContent).toBe(`${sum(1)} instances`);
    expect(links.at(3)?.textContent).toBe(`${sum(2)} relations`);
  });

  it("lists each undeclared observed edge as a row, with its count", () => {
    const root = renderOverview();
    const undeclared = listUndeclaredEdges(classEdges);
    expect(undeclared.length).toBeGreaterThan(0);
    const rows = root.querySelectorAll(".undeclared tbody tr");
    expect(rows).toHaveLength(undeclared.length);
    for (const [index, row] of [...rows].entries()) {
      expect(row.querySelectorAll("td a")).toHaveLength(3);
      expect(row.querySelector("td.is-figure")?.textContent).toBe(
        String(undeclared.at(index)?.count),
      );
    }
  });

  it("says so when every observed edge is declared", () => {
    const declared = classEdges.filter((edge) => edge.declared);
    expect(declared.length).toBeGreaterThan(0);
    expect(listUndeclaredEdges(declared)).toEqual([]);
    const root = renderOverview(declared);
    const section = root.querySelector(".undeclared");
    expect(section?.querySelector(".edges")).toBeNull();
    expect(section?.querySelector(".prose")?.textContent).toBe(
      String(MESSAGES["inspector.overview.undeclared.none"]),
    );
  });
});
