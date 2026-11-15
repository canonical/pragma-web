/**
 * The well over the real ontology's layout: the canvas and the phone
 * view, the selection kept in step with the URL, the shared focus from the
 * pointer and the keyboard, the arrows moving along the tree and Escape
 * lifting the fade.
 */

import {
  createGraphBudget,
  GRAPH_BUDGET,
  requireDefined,
  requireEntry,
} from "@canonical/prism-core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import createAllNamespacesFilter from "../../../../testing/createAllNamespacesFilter.js";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import createRouterHarness from "../../../../testing/createRouterHarness.js";
import { CROSS_REGION_GRAPH } from "../../../../testing/fixtures.js";
import ontologyGraph from "../../../../testing/records/ontologyGraph.js";
import { MIN_FIT } from "../../classGraph/constants.js";
import layOutClassGraph from "../../classGraph/layOutClassGraph.js";
import frameOpeningView from "./frameOpeningView.js";
import HierarchyWell from "./HierarchyWell.js";
import type { HierarchyWellProps } from "./types.js";

const { layout, terms, uris } = createClassGraphSetup();
const ALL = createAllNamespacesFilter(["ds", "cs", "anatomy"]);

/** Mount the well over the layout under the lens's router. */
function renderWell(props: Partial<HierarchyWellProps> = {}) {
  const onHoverTerm = vi.fn();
  const view = render(
    createRouterHarness(
      <HierarchyWell
        filter={ALL}
        hoverCentre={undefined}
        layout={layout}
        onHoverTerm={onHoverTerm}
        term={undefined}
        terms={terms}
        {...props}
      />,
    ),
  );
  return { ...view, onHoverTerm };
}

/** The canvas's group of a class, by its compact term. */
function nodeOf(container: HTMLElement, term: string): Element {
  const node = container.querySelector(`.desktop .node[data-id="${term}"]`);
  if (node === null) throw new Error(`no class ${term} is drawn`);
  return node;
}

/** The canvas's link of a class, by its compact term. */
function linkOf(container: HTMLElement, term: string): HTMLElement {
  const link = nodeOf(container, term).querySelector<HTMLElement>(".target");
  if (link === null) throw new Error(`no link for ${term}`);
  return link;
}

describe("HierarchyWell", () => {
  it("draws the graph on its canvas and in rail order for a phone", () => {
    const { container } = renderWell();
    expect(
      screen.getByRole("group", { name: "Class graph" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Class graph, in rail order" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".desktop .node")).toHaveLength(
      layout.nodes.size,
    );
    expect(
      container.querySelector(".class-graph")?.getAttribute("data-fit-zoom"),
    ).toBe(layout.fitZoom.toFixed(4));
  });

  it("opens on the layout's view, or a window around the class on arrival", () => {
    const viewBoxOf = (container: HTMLElement) =>
      container.querySelector(".desktop svg.viewport")?.getAttribute("viewBox");
    const { view } = layout;
    expect(viewBoxOf(renderWell().container)).toBe(
      `${view.x} ${view.y} ${view.w} ${view.h}`,
    );
    const term = "cs:CodeStandard";
    const opened = frameOpeningView(
      layout,
      layout.nodes.get(requireEntry(uris, term)),
    );
    expect(viewBoxOf(renderWell({ term }).container)).toBe(
      `${opened.x} ${opened.y} ${opened.width} ${opened.height}`,
    );
  });

  it("lays the lattice under the whole graph, however small the window it opens on", () => {
    const { container } = renderWell();
    const floor = container.querySelector(".desktop .floor");
    expect(floor?.getAttribute("x")).toBe(
      String(layout.viewBox.x - 2 * layout.viewBox.w),
    );
    expect(floor?.getAttribute("width")).toBe(String(5 * layout.viewBox.w));
    expect(floor?.getAttribute("height")).toBe(String(5 * layout.viewBox.h));
  });

  it("gives the graph one tab stop, on the first class without a selection", () => {
    const { container } = renderWell();
    const stops = container.querySelectorAll('.desktop a[tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect(stops.item(0).closest(".node")?.getAttribute("data-id")).toBe(
      requireEntry(terms, layout.rail.at(0) ?? ""),
    );
  });

  it("rings the selected term, draws its lineage and fades the rest", () => {
    const { container } = renderWell({ term: "ds:Component" });
    expect(
      nodeOf(container, "ds:Component").querySelector(".ring.is-selected"),
    ).not.toBeNull();
    expect(
      container.querySelectorAll(".desktop .chain").length,
    ).toBeGreaterThan(0);
    expect(
      container.querySelectorAll(".desktop .node.is-faded").length,
    ).toBeGreaterThan(0);
    expect(linkOf(container, "ds:Component")).toHaveAttribute("tabindex", "0");
    // The phone view rings the same row.
    expect(
      container.querySelector(
        '.phone .row.is-selected[data-id="ds:Component"] > .ring.is-selected',
      ),
    ).not.toBeNull();
  });

  it("makes the shared hover centre the focus, ringed, with its labels", () => {
    const { container } = renderWell({
      term: "ds:Component",
      hoverCentre: "ds:Tag",
    });
    const ring = nodeOf(container, "ds:Tag").querySelector(".ring");
    expect(ring?.getAttribute("class")).toBe("ring");
    expect(nodeOf(container, "ds:Tag")).not.toHaveClass("is-faded");
    expect(
      container.querySelectorAll(".desktop .edge-label").length,
    ).toBeGreaterThan(0);
    // The selection's lineage waits while another class is the focus.
    expect(container.querySelector(".desktop .chain")).toBeNull();
  });

  it("raises the class a pointer or the keyboard is on, and clears it on leaving", () => {
    const { container, onHoverTerm } = renderWell();
    fireEvent.mouseOver(
      nodeOf(container, "ds:Tag").querySelector("rect") as Element,
    );
    fireEvent.focus(linkOf(container, "ds:Entity"));
    fireEvent.mouseLeave(container.querySelector(".hierarchy-well") as Element);
    fireEvent.blur(linkOf(container, "ds:Entity"));
    expect(onHoverTerm.mock.calls).toEqual([
      ["ds:Tag"],
      ["ds:Entity"],
      [undefined],
      [undefined],
    ]);
  });

  it("labels only the relation a pointer is on, and rings its ends", () => {
    const edge = layout.edges.find(
      (candidate) =>
        candidate.kind === "relation" && candidate.from !== candidate.to.at(0),
    );
    if (edge === undefined) throw new Error("the graph has no relation");
    const { container } = renderWell();
    const hit = container.querySelector(
      `.desktop [data-edge="${edge.id}"] .hit`,
    );
    fireEvent.mouseOver(hit as Element);
    const labels = container.querySelectorAll(".desktop .edge-label");
    expect(labels.length).toBeLessThanOrEqual(1);
    for (const end of [edge.from, ...edge.to]) {
      expect(
        nodeOf(container, requireEntry(terms, end)).querySelector(".ring"),
      ).not.toBeNull();
    }
    fireEvent.mouseLeave(container.querySelector(".hierarchy-well") as Element);
    expect(container.querySelector(".desktop .ring")).toBeNull();
  });

  it("moves the keyboard along the tree with the arrows and Home", () => {
    const { container } = renderWell({ term: "ds:Component" });
    const component = requireEntry(
      layout.nodes,
      requireEntry(uris, "ds:Component"),
    );
    const start = linkOf(container, "ds:Component");
    act(() => start.focus());
    fireEvent.keyDown(start, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(
      linkOf(container, requireEntry(terms, component.nav.left ?? "")),
    );
    fireEvent.keyDown(document.activeElement as Element, { key: "Home" });
    expect(document.activeElement).toBe(
      linkOf(container, requireEntry(terms, component.nav.home)),
    );
    // The root has no superclass: the left arrow stays put.
    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(
      linkOf(container, requireEntry(terms, component.nav.home)),
    );
    // A key the tree does not read changes nothing.
    fireEvent.keyDown(document.activeElement as Element, { key: "a" });
    expect(document.activeElement).toBe(
      linkOf(container, requireEntry(terms, component.nav.home)),
    );
  });

  it("lifts the fade on Escape, then leaves the graph on a second Escape", () => {
    const onKeyDown = vi.fn();
    const { container } = renderWell({ term: "ds:Component", onKeyDown });
    const link = linkOf(container, "ds:Component");
    act(() => link.focus());
    fireEvent.keyDown(link, { key: "Escape" });
    expect(container.querySelector(".desktop .node.is-faded")).toBeNull();
    fireEvent.keyDown(link, { key: "Escape" });
    expect(document.activeElement).not.toBe(link);
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    // An arrow brings the fade back.
    act(() => link.focus());
    fireEvent.keyDown(link, { key: "ArrowLeft" });
    expect(container.querySelector(".desktop .node.is-faded")).not.toBeNull();
  });

  it("reads no key that does not come from a class", () => {
    const { container } = renderWell({ term: "ds:Component" });
    const fit = screen.getByRole("button", { name: "Fit" });
    fireEvent.keyDown(fit, { key: "Escape" });
    expect(container.querySelector(".desktop .node.is-faded")).not.toBeNull();
  });

  it("hides what the chips leave out and dims what the search leaves out", () => {
    const { container } = renderWell({
      filter: { ...createAllNamespacesFilter(["ds", "cs"]), text: "tag" },
    });
    expect(container.querySelectorAll(".desktop .node.is-hidden")).toHaveLength(
      12,
    );
    expect(nodeOf(container, "ds:Component")).toHaveClass("is-dimmed");
    expect(container.querySelectorAll(".phone .row.is-hidden")).toHaveLength(
      12,
    );
  });

  describe("the camera", () => {
    /**
     * Lay the viewport out at the whole graph's size, or the given one, and
     * move it at once.
     */
    const stubViewport = (
      { w, h } = { w: layout.viewBox.w, h: layout.viewBox.h },
    ): void => {
      vi.stubGlobal(
        "matchMedia",
        (query: string) =>
          ({ matches: true, media: query }) as unknown as MediaQueryList,
      );
      vi.spyOn(SVGElement.prototype, "getBoundingClientRect").mockReturnValue({
        width: w,
        height: h,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: w,
        bottom: h,
        toJSON: () => ({}),
      });
    };
    const readCamera = (container: HTMLElement): string | null =>
      container.querySelector(".desktop .camera")?.getAttribute("transform") ??
      null;
    /** The camera's scale, read off its transform. */
    const readTransform = (container: HTMLElement): { k: number } => ({
      k: Number(/scale\(([^)]+)\)/.exec(readCamera(container) ?? "")?.at(1)),
    });
    /** The opening viewBox's on-screen scale in a viewport of a size. */
    const measureScale = (w: number, h: number): { scale: number } => {
      const viewBox = frameOpeningView(layout, undefined);
      return {
        scale: Math.min(w / viewBox.width, h / viewBox.height),
      };
    };
    /** The well under the router, with the given targets. */
    const drawWell = (props: Partial<HierarchyWellProps>) =>
      createRouterHarness(
        <HierarchyWell
          filter={ALL}
          hoverCentre={undefined}
          layout={layout}
          onHoverTerm={() => {}}
          term={undefined}
          terms={terms}
          {...props}
        />,
      );

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("opens on the whole graph where the canvas holds it legibly", () => {
      stubViewport();
      const { container } = render(drawWell({}));
      const { k } = readTransform(container);
      const { scale } = measureScale(layout.viewBox.w, layout.viewBox.h);
      expect(scale * k).toBeCloseTo(1, 10);
      expect(screen.getByRole("status").textContent).toBe("100%");
    });

    it.each([
      { w: 590.67, h: 658 },
      { w: 632, h: 546 },
      { w: 504, h: 570 },
    ])("opens a $w by $h canvas at a legible zoom", ({ w, h }) => {
      stubViewport({ w, h });
      const { container } = render(drawWell({}));
      const { scale } = measureScale(w, h);
      expect(scale * readTransform(container).k).toBeGreaterThanOrEqual(
        MIN_FIT,
      );
    });

    it("fits the classes the chips leave, and Fit restores them", () => {
      stubViewport();
      const { container, rerender } = render(drawWell({}));
      const opened = readCamera(container);
      expect(opened).not.toBeNull();
      rerender(drawWell({ filter: createAllNamespacesFilter(["cs"]) }));
      const fitted = readCamera(container);
      expect(fitted).not.toBeNull();
      expect(fitted).not.toBe(opened);
      fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
      fireEvent.click(screen.getByRole("button", { name: "Fit" }));
      expect(readCamera(container)).toBe(fitted);
    });

    it("refits what the chips leave to a legible window that cuts no class", () => {
      const canvas = { w: 590.67, h: 778 };
      stubViewport(canvas);
      const { container, rerender } = render(drawWell({}));
      rerender(drawWell({ filter: createAllNamespacesFilter(["ds"]) }));
      const [, x, y, k] = (
        /translate\(([^,]+),([^)]+)\) scale\(([^)]+)\)/.exec(
          readCamera(container) ?? "",
        ) ?? []
      ).map(Number);
      const viewBox = frameOpeningView(layout, undefined);
      const { scale } = measureScale(canvas.w, canvas.h);
      expect(scale * (k ?? 0)).toBeGreaterThanOrEqual(MIN_FIT);
      const toWorld = (user: number, shift: number | undefined): number =>
        (user - (shift ?? 0)) / (k ?? 1);
      const left = toWorld(viewBox.x, x);
      const top = toWorld(viewBox.y, y);
      const right = toWorld(viewBox.x + canvas.w / scale, x);
      const bottom = toWorld(viewBox.y + canvas.h / scale, y);
      const cut = [...layout.nodes.values()]
        .filter((node) => node.region === "ds")
        .filter(
          (node) =>
            node.x < right &&
            node.x + node.w > left &&
            node.y < bottom &&
            node.y + node.h > top &&
            (node.x < left || node.y < top || node.x + node.w > right),
        );
      expect(cut).toEqual([]);
    });

    it("fits a picked region once per pick, and Fit restores the graph", () => {
      stubViewport();
      const { container, rerender } = render(drawWell({}));
      fireEvent.click(screen.getByRole("button", { name: "Fit" }));
      const whole = readCamera(container);
      rerender(drawWell({ region: { prefix: "cs", serial: 1 } }));
      const region = readCamera(container);
      expect(region).not.toBeNull();
      expect(region).not.toBe(whole);
      fireEvent.click(screen.getByRole("button", { name: "Fit" }));
      expect(readCamera(container)).toBe(whole);
      rerender(drawWell({ region: { prefix: "cs", serial: 2 } }));
      expect(readCamera(container)).toBe(region);
    });

    it("leaves the camera alone for a region the graph does not draw", () => {
      stubViewport();
      const { container, rerender } = render(drawWell({}));
      const opened = readCamera(container);
      rerender(drawWell({ region: { prefix: "zz", serial: 1 } }));
      expect(readCamera(container)).toBe(opened);
    });

    it("pans the selected class into view when it is out of view", () => {
      stubViewport();
      const { container, rerender } = render(drawWell({}));
      for (let step = 0; step < 4; step += 1) {
        fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
      }
      const zoomed = readCamera(container);
      const last = requireEntry(terms, layout.rail.at(-1) ?? "");
      rerender(drawWell({ term: last }));
      expect(readCamera(container)).not.toBe(zoomed);
    });
  });

  it("labels no relation whose edge the chips hide", () => {
    const cross = createClassGraphSetup(CROSS_REGION_GRAPH);
    const drawCross = (namespaces: readonly string[]) =>
      createRouterHarness(
        <HierarchyWell
          filter={createAllNamespacesFilter(namespaces)}
          hoverCentre="ex:Whole"
          layout={cross.layout}
          onHoverTerm={() => {}}
          term={undefined}
          terms={cross.terms}
        />,
      );
    const crossing = '.desktop .label-layer [data-edge="rel:ex:Whole zz:Leaf"]';
    const { container, rerender } = render(drawCross(["ex", "zz"]));
    expect(container.querySelector(crossing)).not.toBeNull();
    rerender(drawCross(["ex"]));
    expect(
      container.querySelector('.desktop path[class~="is-hidden"]'),
    ).not.toBeNull();
    expect(container.querySelector(crossing)).toBeNull();
  });

  it("merges a class name and passes native props to its root", () => {
    const { container } = renderWell({ className: "well", id: "graph" });
    const root = container.querySelector("#graph");
    expect(root?.className).toBe("ds hierarchy-well well");
    expect(root?.getAttribute("data-slot")).toBe("explorer-canvas");
  });

  it("labels three or more relations between two classes by their count", () => {
    const pair = createClassGraphSetup({
      classes: ["Family", "Member"].map((label) => ({
        uri: `ex:${label}`,
        label,
        prefix: "ex",
        abstract: false,
        superclass: null,
        instanceCount: 0,
        fields: 0,
      })),
      relations: ["has", "holds", "keeps"].map((label) => ({
        uri: `ex:${label}`,
        label,
        domain: "ex:Family",
        range: "ex:Member",
        count: 1,
      })),
    });
    const { container } = render(
      createRouterHarness(
        <HierarchyWell
          filter={createAllNamespacesFilter(["ex"])}
          hoverCentre="ex:Family"
          layout={pair.layout}
          onHoverTerm={() => {}}
          term={undefined}
          terms={pair.terms}
        />,
      ),
    );
    expect(container.querySelector(".desktop .edge-label")?.textContent).toBe(
      "3 relations",
    );
  });
});

describe("over a layout whose rail opens on a box", () => {
  // Within two nodes the larger namespace, aa, collapses to a box that
  // the rail lists before zz's one class.
  const klass = (prefix: string, local: string) => ({
    uri: `https://${prefix}.example/${local}`,
    label: local,
    prefix,
    abstract: false,
    superclass: null,
    instanceCount: 0,
    fields: 0,
  });
  const input = {
    classes: [
      klass("aa", "A1"),
      klass("aa", "A2"),
      klass("aa", "A3"),
      klass("zz", "Z1"),
    ],
    relations: [],
  };
  const boxed = layOutClassGraph(input, {
    budget: createGraphBudget({ drawnNodesMax: 2 }),
  });
  const boxedTerms = new Map(
    input.classes.map((entry) => [
      entry.uri,
      `${entry.prefix}:${entry.uri.split("/").at(-1)}`,
    ]),
  );
  const drawBoxed = (term: string | undefined, hoverCentre?: string) =>
    createRouterHarness(
      <HierarchyWell
        filter={createAllNamespacesFilter(["aa", "zz"])}
        hoverCentre={hoverCentre}
        layout={boxed}
        onHoverTerm={vi.fn()}
        term={term}
        terms={boxedTerms}
      />,
    );

  it("puts the tab stop on the first class drawn", () => {
    expect(boxed.rail.at(0)).toBe("region:aa");
    const { container } = render(drawBoxed(undefined));
    const stops = container.querySelectorAll('.desktop a[tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect(stops[0]?.closest(".node")?.getAttribute("data-id")).toBe("zz:Z1");
  });

  it("lights the box of a hovered or focused class the canvas does not draw", () => {
    // The rail's row of aa:A3, under the pointer or the keyboard, makes
    // aa's box the focus: the box stays lit and what is outside its
    // neighbourhood fades.
    const { container } = render(drawBoxed(undefined, "aa:A3"));
    const box = container.querySelector('.desktop .node[data-kind="region"]');
    expect(box?.classList.contains("is-faded")).toBe(false);
    expect(
      [...container.querySelectorAll(".desktop .node.is-faded")].map((node) =>
        node.getAttribute("data-id"),
      ),
    ).toEqual(["zz:Z1"]);
    expect(container.querySelectorAll('.desktop a[tabindex="0"]')).toHaveLength(
      1,
    );
  });

  it("fades nothing for a selected class the canvas does not draw", () => {
    const { container } = render(drawBoxed("aa:A2"));
    expect(container.querySelectorAll(".desktop .node.is-faded")).toHaveLength(
      0,
    );
  });

  it("makes a box a link to its namespace drilled, a tab stop of its own off the tree's moves", () => {
    const onHoverTerm = vi.fn();
    const { container } = render(
      createRouterHarness(
        <HierarchyWell
          filter={createAllNamespacesFilter(["aa", "zz"])}
          hoverCentre={undefined}
          layout={boxed}
          onHoverTerm={onHoverTerm}
          term={undefined}
          terms={boxedTerms}
        />,
      ),
    );
    const box = container.querySelector('.desktop .node[data-kind="region"]');
    expect(box?.getAttribute("role")).toBeNull();
    const link = box?.querySelector("a") as HTMLElement;
    expect(link.getAttribute("href")).toBe("/definitions?expand=aa");
    expect(link.getAttribute("aria-label")).toBe(
      "Namespace aa, drawn as one box: 3 classes, 0 relations inside, 0 relations out. Opens the namespace",
    );
    // Reached by Tab: no tabindex keeps it out of the order.
    expect(link.hasAttribute("tabindex")).toBe(false);
    fireEvent.focus(link);
    expect(onHoverTerm).toHaveBeenLastCalledWith("aa");
    const before = document.activeElement;
    fireEvent.keyDown(link, { key: "ArrowDown" });
    expect(document.activeElement).toBe(before);
    // The phone view's row of the box links the same way.
    expect(
      container
        .querySelector('.phone .row[data-kind="region"] a')
        ?.getAttribute("href"),
    ).toBe("/definitions?expand=aa");
  });

  it("opens a drill the address changes anew, forgetting the camera kept for the other view", () => {
    const drilled = layOutClassGraph(input, {
      budget: createGraphBudget({ drawnNodesMax: 2 }),
      drill: "aa",
    });
    const kept = { camera: { k: 2, x: 30, y: 40 }, moved: true };
    const memory = { current: kept as typeof kept | undefined };
    const draw = (shown: typeof boxed, remembers = true) =>
      createRouterHarness(
        <HierarchyWell
          cameraMemory={remembers ? memory : undefined}
          filter={createAllNamespacesFilter(["aa", "zz"])}
          hoverCentre={undefined}
          layout={shown}
          onHoverTerm={vi.fn()}
          term={undefined}
          terms={boxedTerms}
        />,
      );
    const { container, rerender } = render(draw(boxed));
    const canvas = container.querySelector(".desktop");
    // A render on the same view keeps the canvas and the camera.
    rerender(draw(boxed));
    expect(container.querySelector(".desktop")).toBe(canvas);
    expect(memory.current).toBe(kept);
    // The drill moves: a new canvas opens on it, as a load would.
    rerender(draw(drilled));
    expect(container.querySelector(".desktop")).not.toBe(canvas);
    expect(memory.current).toBeUndefined();
    // With no memory to forget, the canvas still opens anew.
    const opened = container.querySelector(".desktop");
    rerender(draw(boxed, false));
    expect(container.querySelector(".desktop")).not.toBe(opened);
  });

  it("links every box when every namespace is a box and the rail holds no class", () => {
    const allBoxed = layOutClassGraph(input, {
      budget: createGraphBudget({ drawnNodesMax: 1 }),
    });
    expect(
      allBoxed.rail.every((uri) => allBoxed.nodes.get(uri)?.kind !== "class"),
    ).toBe(true);
    const { container } = render(
      createRouterHarness(
        <HierarchyWell
          filter={createAllNamespacesFilter(["aa", "zz"])}
          hoverCentre={undefined}
          layout={allBoxed}
          onHoverTerm={vi.fn()}
          term={undefined}
          terms={boxedTerms}
        />,
      ),
    );
    for (const view of [".desktop", ".phone"]) {
      const boxes = [
        ...container.querySelectorAll(`${view} [data-kind="region"]`),
      ];
      expect(boxes, view).toHaveLength(2);
      expect(
        boxes.map((box) => box.querySelector("a")?.getAttribute("href")),
        view,
      ).toEqual(["/definitions?expand=aa", "/definitions?expand=zz"]);
    }
    expect(
      container.querySelector('.desktop [data-kind="region"][role="img"]'),
    ).toBeNull();
  });

  it("keeps the page's other view keys on a box's link and on the way back", () => {
    const drilled = layOutClassGraph(input, {
      budget: createGraphBudget({ drawnNodesMax: 2 }),
      drill: "aa",
    });
    const draw = (shown: typeof boxed, url: string) =>
      createRouterHarness(
        <HierarchyWell
          filter={createAllNamespacesFilter(["aa", "zz"])}
          hoverCentre={undefined}
          layout={shown}
          onHoverTerm={vi.fn()}
          term={undefined}
          terms={boxedTerms}
        />,
        url,
      );
    const rest = render(draw(boxed, "/definitions?q=x&sheet=filter"));
    const href = rest.container
      .querySelector('.desktop [data-kind="region"] a')
      ?.getAttribute("href");
    expect(new URL(href ?? "", "https://site.example").search).toBe(
      "?q=x&sheet=filter&expand=aa",
    );
    rest.unmount();
    const opened = render(draw(drilled, "/definitions?expand=aa&q=x"));
    const backs = [...opened.container.querySelectorAll("a.way-back")].map(
      (link) => link.getAttribute("href"),
    );
    expect(backs).toEqual(["/definitions?q=x", "/definitions?q=x"]);
  });

  it("draws a box on a term page as an image, with no link", () => {
    const { container } = render(drawBoxed("zz:Z1"));
    const box = container.querySelector('.desktop .node[data-kind="region"]');
    expect(box?.getAttribute("role")).toBe("img");
    expect(box?.querySelector("a")).toBeNull();
    expect(container.querySelector('a[href*="expand="]')).toBeNull();
  });

  it("makes a hovered box or stub the focus, ringed, with its bridges named", () => {
    const docs = layOutClassGraph(ontologyGraph, { budget: GRAPH_BUDGET });
    const docsTerms = new Map(
      ontologyGraph.classes.map((entry) => [
        entry.uri,
        `${entry.prefix}:${entry.uri.split("/").at(-1)}`,
      ]),
    );
    const bridged = (centre: string) => {
      const { container } = render(
        createRouterHarness(
          <HierarchyWell
            filter={createAllNamespacesFilter(["ds", "cs", "anatomy"])}
            hoverCentre={centre}
            layout={docs}
            onHoverTerm={vi.fn()}
            term={undefined}
            terms={docsTerms}
          />,
        ),
      );
      return container;
    };
    for (const node of docs.nodes.values()) {
      if (node.kind === "class") continue;
      const container = bridged(requireDefined(node.term, "a box's term"));
      const drawn = container.querySelector(
        `.desktop .node[data-id="${node.term}"]`,
      );
      expect(drawn?.querySelector(".ring"), node.uri).not.toBeNull();
      expect(drawn?.classList.contains("is-faded")).toBe(false);
      // Every bridge at the focus is named: none is left without a label.
      const bridges = docs.edges.filter(
        (edge) =>
          edge.bridge === true &&
          (edge.from === node.uri || edge.to.includes(node.uri)),
      );
      expect(bridges.length, node.uri).toBeGreaterThan(0);
      for (const edge of bridges) {
        expect(
          container.querySelector(
            `.desktop [data-layer="labels"] [data-edge="${edge.id}"] .edge-label`,
          ),
          edge.id,
        ).not.toBeNull();
      }
    }
  });
});
