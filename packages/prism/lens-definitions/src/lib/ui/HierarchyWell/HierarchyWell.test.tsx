/**
 * The well over the real ontology's layout: the canvas and the phone
 * view, the selection kept in step with the URL, the shared focus from the
 * pointer and the keyboard, the arrows moving along the tree and Escape
 * lifting the fade.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import createAllNamespacesFilter from "../../../../testing/createAllNamespacesFilter.js";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import createRouterHarness from "../../../../testing/createRouterHarness.js";
import { requireEntry } from "../../classGraph/require.js";
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
