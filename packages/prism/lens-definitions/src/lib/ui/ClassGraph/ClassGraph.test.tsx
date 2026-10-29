import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import createRouterHarness from "../../../../testing/createRouterHarness.js";
import findNeighbourhood from "../../classGraph/findNeighbourhood.js";
import placeEdgeLabels from "../../classGraph/placeEdgeLabels.js";
import { requireEntry } from "../../classGraph/require.js";
import ClassGraph from "./ClassGraph.js";
import type { ClassGraphProps } from "./types.js";

const zoom = vi.hoisted(() => ({
  bucket: "full" as "full" | "hubs" | "overview",
}));

vi.mock("@canonical/prism-core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@canonical/prism-core")>()),
  useGraphZoomBucket: () => zoom.bucket,
}));

const { layout, terms, uris } = createClassGraphSetup();
const uri = (term: string): string => requireEntry(uris, term);

/** Draw the graph in an SVG under the lens's router. */
function draw(props: Partial<ClassGraphProps> = {}): HTMLElement {
  const { container } = render(
    createRouterHarness(
      <svg aria-label="graph" role="img">
        <ClassGraph layout={layout} terms={terms} {...props} />
      </svg>,
    ),
  );
  return container;
}

/** The group of a class, by its compact term. */
function nodeOf(container: HTMLElement, term: string): Element {
  const node = container.querySelector(`.node[data-id="${term}"]`);
  if (node === null) throw new Error(`no class ${term} is drawn`);
  return node;
}

beforeEach(() => {
  zoom.bucket = "full";
});

describe("ClassGraph", () => {
  it("draws every region, edge and class of the layout, in paint order", () => {
    const container = draw();
    const layers = [...container.querySelectorAll("[data-layer]")].map(
      (layer) => layer.getAttribute("data-layer"),
    );
    expect(layers).toEqual([
      "regions",
      "subclass",
      "relations",
      "nodes",
      "labels",
    ]);
    expect(container.querySelectorAll(".region")).toHaveLength(
      layout.regions.length,
    );
    expect(container.querySelectorAll(".node")).toHaveLength(layout.nodes.size);
    const relations = layout.edges.filter((edge) => edge.kind === "relation");
    expect(container.querySelectorAll("path.relation")).toHaveLength(
      relations.length,
    );
    expect(container.querySelectorAll("path.subclass")).toHaveLength(
      layout.edges.length - relations.length,
    );
    expect(container.querySelectorAll(".filled-head")).toHaveLength(
      relations.reduce((sum, edge) => sum + edge.heads.length, 0),
    );
    expect(container.querySelectorAll(".hit")).toHaveLength(relations.length);
  });

  it("writes every geometric fact and encoding on its data attributes", () => {
    const container = draw();
    const entity = requireEntry(layout.nodes, uri("ds:Entity"));
    const node = nodeOf(container, "ds:Entity");
    expect(node.getAttribute("data-x")).toBe(String(entity.x));
    expect(node.getAttribute("data-w")).toBe(String(entity.w));
    expect(node.getAttribute("data-hub")).toBe("true");
    expect(node.getAttribute("data-ns")).toBe("ds");
    expect(node.getAttribute("data-lifecycle")).toBe("none");
    expect(nodeOf(container, "ds:UIBlock").getAttribute("data-kind")).toBe(
      "abstract",
    );
    const relation = container.querySelector("path.relation");
    expect(relation?.getAttribute("data-kind")).toBe("relation");
    expect(Number(relation?.getAttribute("data-count"))).toBeGreaterThan(0);
    const bus = container.querySelector("path.subclass");
    expect(bus?.getAttribute("data-to")?.split(" ").length).toBe(
      Number(bus?.getAttribute("data-count")),
    );
  });

  it("names its regions, with their counts, and its classes at full zoom", () => {
    const container = draw();
    expect(container.querySelector(".region .prefix")?.textContent).toBe(
      layout.regions.at(0)?.prefix.toUpperCase(),
    );
    expect(container.querySelectorAll(".region .count")).toHaveLength(
      layout.regions.length,
    );
    expect(nodeOf(container, "ds:Component").textContent).toContain(
      "Component",
    );
  });

  it("names only its regions and its hubs between the overview and full zoom", () => {
    zoom.bucket = "hubs";
    const container = draw();
    expect(container.querySelectorAll(".region .prefix")).toHaveLength(
      layout.regions.length,
    );
    expect(container.querySelector(".region .count")).toBeNull();
    expect(nodeOf(container, "ds:Entity").textContent).toContain("Entity");
    expect(nodeOf(container, "ds:Component").textContent).toBe("");
  });

  it("draws no text at the overview", () => {
    zoom.bucket = "overview";
    const container = draw();
    expect(container.querySelector(".region-label")).toBeNull();
    expect(container.querySelector("text")).toBeNull();
  });

  it("makes each class a link with one tab stop, named for assistive technology", () => {
    const container = draw({ tabStop: uri("ds:Component") });
    const links = container.querySelectorAll("a.target");
    expect(links).toHaveLength(layout.nodes.size);
    const stops = [...links].filter(
      (link) => link.getAttribute("tabindex") === "0",
    );
    expect(stops).toHaveLength(1);
    expect(stops.at(0)?.getAttribute("href")).toBe(
      "/definitions/ds%3AComponent",
    );
    expect(
      nodeOf(container, "ds:Component")
        .querySelector("a")
        ?.getAttribute("aria-label"),
    ).toMatch(/^Class Component, in ds, \d+ subclasses/);
    expect(
      nodeOf(container, "ds:UIBlock")
        .querySelector("a")
        ?.getAttribute("aria-label"),
    ).toMatch(/^Class UI Block, abstract, in ds/);
  });

  it("draws inert boxes without a tab stop, as a legend does", () => {
    expect(draw().querySelector("a")).toBeNull();
  });

  it("fades everything outside the focus's neighbourhood and accents its relations", () => {
    const focus = uri("ds:UIBlock");
    const near = findNeighbourhood(layout, focus);
    const container = draw({ focus });
    const faded = [...container.querySelectorAll(".node.is-faded")];
    expect(faded).toHaveLength(layout.nodes.size - near.nodes.size);
    const accented = [...container.querySelectorAll("path.relation.is-focus")];
    expect(accented.length).toBeGreaterThan(0);
    for (const path of accented) {
      expect(path.getAttribute("stroke-width")).toBe("2");
    }
    expect(
      container.querySelectorAll(".is-faded.subclass, .is-faded.relation"),
    ).toHaveLength(layout.edges.length - near.edges.size);
    expect(container.querySelector(".chain")).toBeNull();
  });

  it("rings the selection in the accent and draws its lineage while it is the focus", () => {
    const selected = uri("ds:Component");
    const container = draw({ focus: selected, selected });
    expect(
      nodeOf(container, "ds:Component")
        .querySelector(".ring")
        ?.getAttribute("class"),
    ).toBe("ring is-selected");
    const chain = [...container.querySelectorAll(".chain")].map((hop) => [
      hop.getAttribute("data-from"),
      hop.getAttribute("data-to"),
    ]);
    // Each hop runs from the superclass down, the class's own last.
    expect(chain).toEqual([
      ["ds:UIBlock", "ds:Component"],
      ["ds:UIElement", "ds:UIBlock"],
      ["ds:Entity", "ds:UIElement"],
    ]);
  });

  it("keeps the selection's ring but not its lineage while another class is the focus", () => {
    const container = draw({
      focus: uri("ds:Entity"),
      selected: uri("ds:Component"),
    });
    expect(
      nodeOf(container, "ds:Component").querySelector(".ring.is-selected"),
    ).not.toBeNull();
    expect(container.querySelector(".chain")).toBeNull();
  });

  it("rings the active class and the ends of the active relation in the focus colour", () => {
    const edge = layout.edges.find(
      (candidate) => candidate.kind === "relation",
    );
    if (edge === undefined) throw new Error("the graph has no relation");
    const container = draw({ active: uri("cs:Category"), activeEdge: edge.id });
    const ringed = [...container.querySelectorAll(".ring")].map((ring) =>
      ring.closest(".node")?.getAttribute("data-id"),
    );
    expect(new Set(ringed)).toEqual(
      new Set([
        "cs:Category",
        ...[edge.from, ...edge.to].map((end) => requireEntry(terms, end)),
      ]),
    );
    expect(container.querySelector(".ring.is-selected")).toBeNull();
  });

  it("hides the filtered classes with the edges that lose an end, and dims the searched", () => {
    const hidden = new Set(
      [...layout.nodes.values()]
        .filter((node) => node.region === "anatomy")
        .map((node) => node.uri),
    );
    const container = draw({ hidden, dimmed: new Set([uri("ds:Tag")]) });
    expect(container.querySelectorAll(".node.is-hidden")).toHaveLength(
      hidden.size,
    );
    const lost = layout.edges.filter(
      (edge) =>
        hidden.has(edge.from) || edge.to.every((end) => hidden.has(end)),
    );
    expect(lost.length).toBeGreaterThan(0);
    expect(
      container.querySelectorAll(
        "path.subclass.is-hidden, path.relation.is-hidden",
      ),
    ).toHaveLength(lost.length);
    expect(container.querySelectorAll(".hit")).toHaveLength(
      layout.edges.filter((edge) => edge.kind === "relation").length -
        lost.filter((edge) => edge.kind === "relation").length,
    );
    expect(nodeOf(container, "ds:Tag").getAttribute("class")).toBe(
      "node is-dimmed",
    );
  });

  it("draws the placed labels on a halo, in the accent for the focus's relations", () => {
    const focus = uri("ds:Tag");
    const near = findNeighbourhood(layout, focus).nodes;
    const labels = placeEdgeLabels(
      layout,
      focus,
      new Set([...layout.nodes.keys()].filter((id) => !near.has(id))),
      (count) => `${count} relations`,
      (count) => `${count} classes`,
    );
    expect(labels.placed.length).toBeGreaterThan(0);
    const container = draw({ focus, labels });
    expect(container.querySelectorAll(".label-halo")).toHaveLength(
      labels.placed.length,
    );
    expect(container.querySelectorAll(".edge-label.is-focus")).toHaveLength(
      labels.placed.length,
    );
  });

  it("draws the pointed relation's label quietly, without the focus's accent", () => {
    const focus = uri("ds:Tag");
    const labels = placeEdgeLabels(
      layout,
      focus,
      new Set(),
      (count) => `${count} relations`,
      (count) => `${count} classes`,
    );
    const label = labels.placed.at(0);
    if (label === undefined) throw new Error("no label was placed");
    const container = draw({
      focus,
      activeEdge: label.edge,
      labels: { placed: [label], omitted: [] },
    });
    expect(container.querySelector(".edge-label")?.getAttribute("class")).toBe(
      "edge-label",
    );
  });

  it("hides its labels below full zoom", () => {
    zoom.bucket = "hubs";
    const labels = placeEdgeLabels(
      layout,
      uri("ds:Tag"),
      new Set(),
      (count) => `${count} relations`,
      (count) => `${count} classes`,
    );
    expect(draw({ labels }).querySelector(".edge-label")).toBeNull();
  });

  it("merges a class name and passes native props to its root group", () => {
    const container = draw({
      className: "custom-class",
      "aria-label": "Classes",
    });
    const root = container.querySelector(".ds.class-graph");
    expect(root?.getAttribute("class")).toBe("ds class-graph custom-class");
    expect(root?.getAttribute("aria-label")).toBe("Classes");
  });
});
