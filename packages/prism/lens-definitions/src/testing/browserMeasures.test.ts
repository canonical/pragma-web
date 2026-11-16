import { describe, expect, it } from "vitest";
import measureCanvasSvg from "../../testing/browser/measureCanvasSvg.js";
import sliceCanvasSvg from "../../testing/browser/sliceCanvasSvg.js";
import type { ServedGraph } from "../../testing/browser/types.js";
import weighServedRelations from "../../testing/browser/weighServedRelations.js";

const property = (
  uri: string,
  domain: string | null,
  range: string,
  kind = "OBJECT",
) => ({ uri, kind, domain: domain === null ? null : { uri: domain }, range });

const GRAPH: ServedGraph = {
  ontologies: [
    {
      prefix: "aa",
      namespace: "https://aa.example/",
      classes: [
        { uri: "https://aa.example/A" },
        { uri: "https://aa.example/B" },
      ],
      properties: [
        property("https://aa.example/p", "https://aa.example/A", "aa:B"),
        property("https://aa.example/q", "https://aa.example/B", "aa:A"),
        property("https://aa.example/r", "https://aa.example/A", "zz:Z"),
        property("https://aa.example/s", "https://aa.example/A", "xsd:string"),
        property(
          "https://aa.example/t",
          "https://aa.example/A",
          "aa:B",
          "DATATYPE",
        ),
        property("https://aa.example/u", null, "aa:B"),
      ],
    },
    {
      prefix: "zz",
      namespace: "https://zz.example/",
      classes: [{ uri: "https://zz.example/Z" }],
      properties: [],
    },
  ],
  classEdges: [
    {
      property: "https://aa.example/p",
      subjectClass: "https://aa.example/A",
      objectClass: "https://aa.example/B",
      count: 7,
      declared: true,
    },
    {
      property: "https://aa.example/q",
      subjectClass: "https://aa.example/B",
      objectClass: "https://aa.example/A",
      count: 9,
      declared: true,
    },
    {
      property: "https://aa.example/r",
      subjectClass: "https://aa.example/A",
      objectClass: "https://zz.example/Z",
      count: 40,
      declared: false,
    },
  ],
};

describe("weighServedRelations", () => {
  it("weighs a pair by its heaviest declared relation, either way, and counts the bridges", () => {
    const { weights, bridges } = weighServedRelations(GRAPH);
    expect(Object.fromEntries(weights)).toEqual({
      "aa:A aa:B": 9,
      "aa:A zz:Z": 0,
    });
    // r to another namespace, s to a class no ontology loads.
    expect(bridges).toBe(2);
  });
});

describe("measureCanvasSvg", () => {
  it("reads the nodes, the lattice, the relations and the size of a canvas's served SVG", () => {
    const html = [
      '<div class="ds graph-canvas desktop"><svg class="viewport" viewBox="-16 -16 590 778">',
      '<g class="region" data-ns="aa" data-x="0" data-y="8"></g>',
      '<g class="node" data-col="0" data-id="aa:A" data-kind="concrete" data-x="0" data-y="0"></g>',
      '<g class="node" data-col="0" data-id="aa:B" data-kind="abstract" data-x="16" data-y="48"></g>',
      '<g class="node" data-col="1" data-id="zz" data-kind="region" data-x="40" data-y="0"></g>',
      '<path class="relation" data-from="aa:A" data-to="aa:B" data-weight="9" stroke-width="1"></path>',
      '<path class="relation is-bridge is-focus" data-from="aa:A" data-to="zz" data-weight="0" stroke-dasharray="4 4" stroke-width="2"></path>',
      '<text class="edge-label is-bridge">r</text>',
      "<svg></svg></svg></div>",
    ].join("");
    const svg = sliceCanvasSvg(html);
    expect(svg.endsWith("<svg></svg></svg>")).toBe(true);
    const measure = measureCanvasSvg(svg);
    expect(measure).toMatchObject({
      nodes: 3,
      kinds: { concrete: 1, abstract: 1, region: 1 },
      largestColumn: 2,
      viewBox: { x: -16, y: -16, w: 590, h: 778 },
      openingZoom: 1,
      offLattice: ["zz", "region aa"],
      bridges: 1,
      bridgeLabels: 1,
      elements: 9,
    });
    expect(measure.relations).toEqual([
      {
        from: "aa:A",
        to: "aa:B",
        weight: 9,
        width: 1,
        dashed: false,
        bridge: false,
        focus: false,
      },
      {
        from: "aa:A",
        to: "zz",
        weight: 0,
        width: 2,
        dashed: true,
        bridge: true,
        focus: true,
      },
    ]);
    expect(measure.sharedBridgeLines).toEqual([]);
    expect(measure.framingBridges).toEqual([]);
    expect(() => sliceCanvasSvg("<p></p>")).toThrow();
    expect(() =>
      sliceCanvasSvg('<div class="graph-canvas desktop"><svg>'),
    ).toThrow();
  });

  const bridge = (d: string): string =>
    `<path class="relation is-bridge" d="${d}" stroke-width="1"></path>`;
  const region = (ns: string, x: number, y: number, w: number, h: number) =>
    `<g class="region" data-ns="${ns}" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}"></g>`;
  const serve = (parts: readonly string[]): string =>
    sliceCanvasSvg(
      `<div class="graph-canvas desktop"><svg viewBox="0 0 1 1">${parts.join("")}</svg></div>`,
    );

  it("lists two bridges whose routes run on one line for a stretch, across or down, and none whose lanes keep apart", () => {
    // Two pairs' bridges along one gap, then along one channel.
    const across = [
      "M368 568H344V488H-24V-24H328V232H256",
      "M320 568H344V488H392V456H368",
    ];
    const down = ["M96 104H132V140H180", "M112 56H132V120H40"];
    expect(measureCanvasSvg(serve([...across, ...down].map(bridge))).sharedBridgeLines).toEqual([
      across.join(" and "),
      down.join(" and "),
    ]);
    expect(
      measureCanvasSvg(
        serve(
          [
            "M368 568H348V492H488V360H328V232H256",
            "M320 568H340V484H392V456H368",
            // Two routes that only meet at a point.
            "M0 0H10V10",
            "M10 10V20H0",
          ].map(bridge),
        ),
      ).sharedBridgeLines,
    ).toEqual([]);
  });

  it("lists a bridge that runs along three sides of a region it leaves or enters, and not one that passes a region it does not join", () => {
    const framing = "M560 376H536V-24H-24V664H152V728H128";
    const svg = serve([
      region("ds", 0, 0, 720, 512),
      region("surface", 0, 560, 160, 80),
      region("dt", 0, 688, 128, 64),
      bridge(framing),
      // Round three sides of surface, which it neither leaves nor enters.
      bridge("M560 376H536V536H-24V660H152V728H128"),
    ]);
    expect(measureCanvasSvg(svg).framingBridges).toEqual([`${framing} round ds`]);
  });
});
