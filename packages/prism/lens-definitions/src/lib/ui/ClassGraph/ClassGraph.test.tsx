import {
  GRAPH_BUDGET,
  measurePathBounds,
  placeEdgeLabels,
  requireAt,
  requireDefined,
  requireEntry,
} from "@canonical/prism-core";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import createRouterHarness from "../../../../testing/createRouterHarness.js";
import { FOUR_NAMESPACE_GRAPH } from "../../../../testing/fixtures.js";
import classEdges from "../../../../testing/records/classEdges.js";
import metroGraph from "../../../../testing/records/metroGraph.js";
import findNeighbourhood from "../../classGraph/findNeighbourhood.js";
import layOutClassGraph from "../../classGraph/layOutClassGraph.js";
import weighStroke from "../../classGraph/weighStroke.js";
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
/** The metro graph, whose geography relations cross into the metro's. */
const metro = createClassGraphSetup(metroGraph);
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

/**
 * The count the captured store serves for a property's declared edge
 * between two classes; 0 when it serves none.
 */
function serveCount(property: string, subject: string, object: string): number {
  return (
    classEdges.find(
      (edge) =>
        edge.declared &&
        edge.property === property &&
        edge.subjectClass === subject &&
        edge.objectClass === object,
    )?.count ?? 0
  );
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

  it("strokes each relation by its weight, dashed where nothing instantiates it", () => {
    const container = draw();
    const drawn = layout.edges.filter((edge) => edge.kind === "relation");
    const strokes = drawn.map((edge) => {
      const path = container.querySelector(`[data-edge="${edge.id}"] path`);
      // The heaviest of the bundle's relations, as the store serves each.
      const weight = Math.max(
        ...(edge.bundle?.relations ?? []).map((relation) =>
          serveCount(relation.uri, relation.domain, relation.range),
        ),
      );
      expect(path?.getAttribute("data-weight")).toBe(String(weight));
      return [
        path?.getAttribute("stroke-width"),
        path?.getAttribute("stroke-dasharray") ?? null,
        weight === 0,
      ];
    });
    expect(
      strokes.every(([width, dash, zero]) =>
        zero ? width === "1" && dash === "4 4" : dash === null,
      ),
    ).toBe(true);
    expect(new Set(strokes.map(([width]) => width))).toEqual(
      new Set(["1", "2", "4", "8"]),
    );
    // A relation nothing instantiates keeps every relation's classes: its
    // dash alone says what it is.
    const dashed = [
      ...container.querySelectorAll("path.relation[stroke-dasharray]"),
    ];
    expect(dashed.map((path) => path.getAttribute("data-weight"))).toEqual(
      strokes.filter(([, , zero]) => zero).map(() => "0"),
    );
    for (const path of dashed) {
      expect(path.getAttribute("class")).toBe("relation");
      expect(
        path.parentElement
          ?.querySelector(".filled-head")
          ?.getAttribute("class"),
      ).toBe("filled-head");
    }
    const bus = container.querySelector("path.subclass");
    expect(bus?.getAttribute("stroke-width")).toBe("1");
    expect(bus?.hasAttribute("data-weight")).toBe(false);
    expect(bus?.hasAttribute("stroke-dasharray")).toBe(false);
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
      const { width } = weighStroke(Number(path.getAttribute("data-weight")));
      expect(path.getAttribute("stroke-width")).toBe(
        String(Math.max(width, 2)),
      );
    }
    expect(
      container.querySelectorAll(".is-faded.subclass, .is-faded.relation"),
    ).toHaveLength(layout.edges.length - near.edges.size);
    expect(container.querySelector(".chain")).toBeNull();
  });

  it("ends a heavy line inside an arrowhead grown to its width", () => {
    const container = draw();
    const heavy = [...container.querySelectorAll("path.relation")].filter(
      (path) => path.getAttribute("stroke-width") === "8",
    );
    expect(heavy.length).toBeGreaterThan(0);
    for (const path of heavy) {
      const heads = [
        ...(path.parentElement?.querySelectorAll(".filled-head") ?? []),
      ];
      expect(heads.length).toBeGreaterThan(0);
      for (const head of heads) {
        const tip = head.getAttribute("d")?.match(/^M(\d+) (\d+)/);
        const bounds = measurePathBounds(head.getAttribute("d") ?? "");
        expect([bounds.w, bounds.h]).toEqual([20, 20]);
        // The line stops 8px short of the tip, where the head is 8px wide.
        const d = path.getAttribute("d") ?? "";
        expect(d.includes(`${tip?.[1]} ${tip?.[2]}`)).toBe(false);
      }
    }
    const light = container.querySelector(
      'path.relation[stroke-width="1"] ~ .filled-head',
    );
    expect(measurePathBounds(light?.getAttribute("d") ?? "").w).toBe(8);
  });

  it("draws a bridge in the strong line, its label at rest at a prefix's size", () => {
    const bridges = metro.layout.edges.filter((edge) => edge.bridge === true);
    // As many bridges as the records hold relations between two prefixes,
    // the one with no statements among them.
    const prefixOf = new Map(
      metroGraph.classes.map((klass) => [klass.uri, klass.prefix]),
    );
    const served = metroGraph.relations.filter(
      ({ domain, range }) =>
        domain !== null &&
        range !== null &&
        prefixOf.get(domain) !== prefixOf.get(range),
    );
    expect(served).toHaveLength(3);
    expect(served.filter((relation) => relation.count === 0)).toHaveLength(1);
    expect(bridges).toHaveLength(served.length);
    const container = draw({ layout: metro.layout, terms: metro.terms });
    for (const edge of bridges) {
      const group = container.querySelector(`[data-edge="${edge.id}"]`);
      expect(group?.querySelector("path")?.getAttribute("class")).toBe(
        "relation is-bridge",
      );
    }
    const labels = [...container.querySelectorAll("text.edge-label.is-bridge")];
    expect(labels).toHaveLength(bridges.length);
    expect(
      container.querySelectorAll("text.label-halo.is-bridge"),
    ).toHaveLength(bridges.length);
    // Every relation that crosses regions is a bridge, and only those.
    for (const edge of metro.layout.edges.filter(
      (candidate) => candidate.kind === "relation",
    )) {
      const [from, to] = [edge.from, ...edge.to].map(
        (id) => requireEntry(metro.layout.nodes, id).region,
      );
      expect(edge.bridge === true).toBe(from !== to);
    }
  });

  it("draws no bridge label in the overview bucket, and none a focus fades", () => {
    const own = { layout: metro.layout, terms: metro.terms };
    zoom.bucket = "overview";
    expect(draw(own).querySelector("text.edge-label.is-bridge")).toBeNull();
    zoom.bucket = "full";
    const bridge = metro.layout.edges.find((edge) => edge.bridge === true);
    const outside = [...metro.layout.nodes.keys()].find(
      (id) => !findNeighbourhood(metro.layout, id).edges.has(bridge?.id ?? ""),
    );
    expect(outside).toBeDefined();
    const labelled = draw({ ...own, focus: outside }).querySelector(
      `.label-layer [data-edge="${bridge?.id}"]`,
    );
    expect(labelled).toBeNull();
  });

  describe("a bridge in the focus's neighbourhood", () => {
    const own = { layout: metro.layout, terms: metro.terms };
    const bridge = requireDefined(
      metro.layout.edges.find((edge) => edge.bridge === true),
      "a bridge",
    );
    const labels = {
      placed: [
        {
          edge: bridge.id,
          lines: ["focus"],
          box: { x: 0, y: 0, w: 32, h: 16 },
          cx: 16,
          cy: 8,
        },
      ],
      omitted: [],
    };
    const groupsOf = (container: HTMLElement) =>
      container.querySelectorAll(`.label-layer [data-edge="${bridge.id}"]`);
    afterEach(() => {
      zoom.bucket = "full";
    });

    it("is named once, by the focus's label, at full zoom", () => {
      const container = draw({ ...own, focus: bridge.from, labels });
      expect(groupsOf(container)).toHaveLength(1);
      expect(
        container.querySelector(
          `.label-layer [data-edge="${bridge.id}"] text.is-bridge`,
        ),
      ).toBeNull();
    });

    it("keeps its label at rest in the hubs bucket, where the focus's are not drawn", () => {
      zoom.bucket = "hubs";
      const container = draw({ ...own, focus: bridge.from, labels });
      expect(groupsOf(container)).toHaveLength(1);
      expect(
        container.querySelector(
          `.label-layer [data-edge="${bridge.id}"] text.edge-label.is-bridge`,
        )?.textContent,
      ).toBe(
        requireAt(requireDefined(bridge.bundle, "bundle").relations, 0).label,
      );
    });

    it("loses its label when a class it ends is hidden", () => {
      const container = draw({ ...own, hidden: new Set([bridge.from]) });
      expect(groupsOf(container)).toHaveLength(0);
    });
  });

  describe("the overview within its budget", () => {
    const own = {
      layout: layOutClassGraph(FOUR_NAMESPACE_GRAPH, { budget: GRAPH_BUDGET }),
      terms: createClassGraphSetup(FOUR_NAMESPACE_GRAPH).terms,
      tabStop: "https://anatomy.canonical.com/Style",
    };
    afterEach(() => {
      zoom.bucket = "full";
    });

    it("draws a collapsed namespace as one inert box with its class count, named at the hubs zoom", () => {
      for (const bucket of ["hubs", "full"] as const) {
        zoom.bucket = bucket;
        const region = nodeOf(draw(own), "surface");
        expect(region.getAttribute("data-kind")).toBe("region");
        expect(region.getAttribute("data-classes")).toBe("31");
        expect(region.textContent).toContain("surface");
        expect(region.textContent).toContain("31 classes");
        expect(region.querySelector("a")).toBeNull();
      }
      zoom.bucket = "full";
      expect(
        draw(own).querySelector('.region[data-ns="surface"] .count')
          ?.textContent,
      ).toBe("31 classes");
    });

    it("draws each external stub as an inert box in a dashed frame, a bridge reaching it", () => {
      const container = draw(own);
      const stubs = [...container.querySelectorAll('.node[data-kind="stub"]')];
      expect(stubs.map((stub) => stub.getAttribute("data-id")).sort()).toEqual([
        "dt:TokenSymbol",
        "rdf:List",
        "vocab:Shelf",
      ]);
      for (const stub of stubs) {
        expect(stub.querySelector("a")).toBeNull();
        expect(
          stub
            .querySelector("rect.stub-frame")
            ?.getAttribute("stroke-dasharray"),
        ).toBe("4 4");
        const term = stub.getAttribute("data-id") ?? "";
        expect(
          container.querySelector(
            `path.relation.is-bridge[data-from="${term}"], path.relation.is-bridge[data-to="${term}"]`,
          ),
        ).not.toBeNull();
      }
    });
  });

  describe("a bridge whose label finds no place at rest", () => {
    // A viewBox with no room leaves every bridge without a place at rest.
    const cramped = {
      ...metro.layout,
      viewBox: { x: 0, y: 0, w: 0, h: 0 },
    };
    const own = { layout: cramped, terms: metro.terms };
    const bridge = requireDefined(
      cramped.edges.find((edge) => edge.bridge === true),
      "a bridge",
    );
    const name = requireAt(
      requireDefined(bridge.bundle, "bundle").relations,
      0,
    ).label;
    const labelOf = (container: HTMLElement) =>
      container.querySelector(
        `.label-layer [data-edge="${bridge.id}"] text.edge-label.is-bridge`,
      );
    afterEach(() => {
      zoom.bucket = "full";
    });

    it("draws no label at rest", () => {
      for (const bucket of ["hubs", "full"] as const) {
        zoom.bucket = bucket;
        expect(labelOf(draw(own))).toBeNull();
      }
    });

    it("is named while a class at either end is the focus, at every zoom that draws labels", () => {
      for (const bucket of ["hubs", "full"] as const) {
        zoom.bucket = bucket;
        for (const end of [bridge.from, ...bridge.to]) {
          expect(labelOf(draw({ ...own, focus: end }))?.textContent).toBe(name);
        }
      }
    });

    it("is not named while the focus is elsewhere, nor at the overview", () => {
      const elsewhere = requireDefined(
        [...cramped.nodes.keys()].find(
          (id) => id !== bridge.from && !bridge.to.includes(id),
        ),
        "a class off the bridge",
      );
      expect(labelOf(draw({ ...own, focus: elsewhere }))).toBeNull();
      zoom.bucket = "overview";
      expect(labelOf(draw({ ...own, focus: bridge.from }))).toBeNull();
    });
  });

  it("keeps a focused relation with no statements dashed, at the focus's 2px", () => {
    const container = draw({ focus: uri("cs:Example") });
    const zero = container.querySelector(
      'path.relation[data-from="cs:CodeStandard"][data-to="cs:Example"]',
    );
    expect(zero?.getAttribute("class")).toBe("relation is-focus");
    expect(zero?.getAttribute("data-weight")).toBe("0");
    expect(zero?.getAttribute("stroke-dasharray")).toBe("4 4");
    expect(zero?.getAttribute("stroke-width")).toBe("2");
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
