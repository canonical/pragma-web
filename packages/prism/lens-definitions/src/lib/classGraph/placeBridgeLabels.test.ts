import { createTranslator } from "@canonical/i18n-core";
import {
  containsPoint,
  intersectsRect,
  parsePathData,
  type Rect,
  requireDefined,
  samplePath,
} from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import {
  BRIDGE_TRIO_GRAPH,
  STACKED_PAIR_GRAPH,
} from "../../../testing/fixtures.js";
import metroGraph from "../../../testing/records/metroGraph.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import { MESSAGES } from "../i18n/index.js";
import layOutClassGraph from "./layOutClassGraph.js";
import placeBridgeLabels from "./placeBridgeLabels.js";
import type { ClassGraphLayout } from "./types.js";

/** The English catalog's translator. */
const t = createTranslator("en", MESSAGES);

/** The bridges of a layout and the labels placed on them. */
function placeOn(layout: ClassGraphLayout) {
  const placement = placeBridgeLabels(layout, t);
  return {
    bridges: layout.edges.filter((edge) => edge.bridge === true),
    labels: placement.placed,
    omitted: placement.omitted,
  };
}

/** Whether a route runs through a box or along its edge. */
function touchesRoute(box: Rect, d: string): boolean {
  return parsePathData(d)
    .flatMap(({ segments }) => segments)
    .some(({ points: [from, to] }) =>
      from === undefined || to === undefined
        ? false
        : Math.min(from[0], to[0]) <= box.x + box.w &&
          box.x <= Math.max(from[0], to[0]) &&
          Math.min(from[1], to[1]) <= box.y + box.h &&
          box.y <= Math.max(from[1], to[1]),
    );
}

describe("placeBridgeLabels", () => {
  it("labels a bridge with its relation's name on the route", () => {
    const { labels } = placeOn(layOutClassGraph(STACKED_PAIR_GRAPH));
    expect(labels.map(({ edge, text }) => [edge, text])).toEqual([
      ["rel:aa:A bb:B", "reaches"],
    ]);
  });

  it("labels every bridge of the captured graphs clear of boxes and of each other, beside its own route", () => {
    for (const graph of [ontologyGraph, metroGraph, BRIDGE_TRIO_GRAPH]) {
      const layout = layOutClassGraph(graph);
      const { bridges, labels, omitted } = placeOn(layout);
      expect(labels.map((label) => label.edge)).toEqual(
        bridges.map((edge) => edge.id).sort(),
      );
      expect(omitted).toEqual([]);
      for (const label of labels) {
        // It lies on or beside a stretch of its own bridge, and touches no
        // other bridge's route, so a reader can tell which line it names.
        for (const bridge of bridges) {
          expect(touchesRoute(label.box, bridge.d)).toBe(
            bridge.id === label.edge,
          );
        }
        for (const node of layout.nodes.values()) {
          expect(intersectsRect(label.box, node)).toBe(false);
        }
        for (const other of labels) {
          if (other !== label)
            expect(intersectsRect(label.box, other.box)).toBe(false);
        }
        // The label sits on its route, centred on a whole pixel.
        expect(Number.isInteger(label.cx) && Number.isInteger(label.cy)).toBe(
          true,
        );
      }
    }
  });

  it("counts a bridge's relations past two", () => {
    const layout = layOutClassGraph({
      ...STACKED_PAIR_GRAPH,
      relations: ["one", "two", "three"].map((label) => ({
        uri: `aa:${label}`,
        label,
        domain: "aa:A",
        range: "bb:B",
        count: 1,
      })),
    });
    expect(placeOn(layout).labels.map((label) => label.text)).toEqual([
      "3 relations",
    ]);
  });

  it("records a bridge with no clear place, for the focus's labels to name", () => {
    const layout = layOutClassGraph(STACKED_PAIR_GRAPH);
    expect(
      placeBridgeLabels({ ...layout, viewBox: { x: 0, y: 0, w: 0, h: 0 } }, t),
    ).toMatchObject({ placed: [], omitted: ["rel:aa:A bb:B"] });
  });

  it("gives an omitted bridge the place its label takes on focus, clear of the boxes", () => {
    const layout = layOutClassGraph(STACKED_PAIR_GRAPH);
    const { onFocus } = placeBridgeLabels(
      { ...layout, viewBox: { x: 0, y: 0, w: 0, h: 0 } },
      t,
    );
    expect(onFocus.map(({ edge, text }) => [edge, text])).toEqual([
      ["rel:aa:A bb:B", "reaches"],
    ]);
    for (const label of onFocus) {
      for (const node of layout.nodes.values()) {
        expect(intersectsRect(label.box, node)).toBe(false);
      }
    }
  });

  it("gives an omitted bridge the place at its arrowhead when no place is clear of the boxes", () => {
    const layout = layOutClassGraph(STACKED_PAIR_GRAPH);
    const anyNode = requireDefined([...layout.nodes.values()].at(0), "a class");
    // A box over the whole graph leaves no place clear.
    const covered = {
      ...layout,
      viewBox: { x: 0, y: 0, w: 0, h: 0 },
      nodes: new Map([
        ...layout.nodes,
        ["cover", { ...anyNode, x: -4096, y: -4096, w: 8192, h: 8192 }],
      ]),
    };
    const { onFocus } = placeBridgeLabels(covered, t);
    const bridge = requireDefined(
      layout.edges.find((edge) => edge.bridge === true),
      "a bridge",
    );
    // The route's far end, where its only head is.
    const end = requireDefined(
      parsePathData(bridge.d)
        .flatMap(({ segments }) => segments)
        .at(-1)
        ?.points.at(-1),
      "the route's end",
    );
    expect(onFocus.map(({ cx, cy }) => [cx, cy])).toEqual([end]);
  });

  it("keeps every bridge's label clear of every other relation's stroke", () => {
    for (const graph of [ontologyGraph, metroGraph, BRIDGE_TRIO_GRAPH]) {
      const layout = layOutClassGraph(graph);
      const { labels } = placeOn(layout);
      const relations = layout.edges.filter(
        (edge) => edge.kind === "relation" && edge.bridge !== true,
      );
      for (const label of labels) {
        for (const relation of relations) {
          // Sampled every px along the stroke, curves included.
          expect(
            samplePath(relation.d, 1).some((point) =>
              containsPoint(point, label.box),
            ),
          ).toBe(false);
        }
      }
    }
  });

  it("names the metro's bridges near their arrowheads", () => {
    const { labels } = placeOn(layOutClassGraph(metroGraph));
    // "stops" sits below the Formation to Unit position curve, which its
    // first place, at y 197, met.
    expect(labels.map(({ text, box }) => [text, box.x, box.y])).toEqual([
      ["location", 304, 365],
      ["in zone", 384, 265],
      ["stops", 91, 217],
    ]);
  });
});
