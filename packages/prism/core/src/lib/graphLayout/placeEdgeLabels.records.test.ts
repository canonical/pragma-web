import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import formatEdgeLabelLines from "./formatEdgeLabelLines.js";
import placeEdgeLabels from "./placeEdgeLabels.js";
import type {
  LabelledBundle,
  LabelledEdge,
  LabelledLayout,
  LabelledNode,
  LabelledRegion,
  LabelPlacement,
  Rect,
} from "./types.js";

/** A layout as recorded: maps as entries, a bundle's heads as an array. */
interface RecordedLayout {
  readonly nodes: readonly [string, LabelledNode][];
  readonly edges: readonly RecordedEdge[];
  readonly regions: readonly LabelledRegion[];
  readonly viewBox: Rect;
}

type RecordedEdge = Omit<LabelledEdge, "bundle"> & {
  readonly bundle?: Omit<LabelledBundle, "heads"> & {
    readonly heads: readonly string[];
  };
};

interface RecordedLines {
  readonly layout: string;
  readonly edge: RecordedEdge;
  readonly result: readonly string[];
}

interface RecordedLabels {
  readonly layout: string;
  readonly viewBox?: Rect;
  readonly focus: string;
  readonly faded: readonly string[];
  readonly result: LabelPlacement;
}

interface Records {
  readonly layouts: Readonly<Record<string, RecordedLayout>>;
  readonly lines: readonly RecordedLines[];
  readonly labels: readonly RecordedLabels[];
}

const records: Records = JSON.parse(
  readFileSync(
    join(
      dirname(new URL(import.meta.url).pathname),
      "placeEdgeLabels.records.json",
    ),
    "utf8",
  ),
);

const formatCount = (count: number): string => `${count} relations`;
const formatClassCount = (count: number): string => `${count} classes`;

function readEdge(edge: RecordedEdge): LabelledEdge {
  const { bundle, ...rest } = edge;
  return bundle === undefined
    ? rest
    : { ...rest, bundle: { ...bundle, heads: new Set(bundle.heads) } };
}

function readLayout(name: string, viewBox?: Rect): LabelledLayout {
  const recorded = records.layouts[name];
  if (recorded === undefined) throw new Error(`no recorded layout ${name}`);
  return {
    nodes: new Map(recorded.nodes),
    edges: recorded.edges.map(readEdge),
    regions: recorded.regions,
    viewBox: viewBox ?? recorded.viewBox,
  };
}

describe("formatEdgeLabelLines", () => {
  it("writes each recorded edge's label as its lines", () => {
    expect(records.lines.length).toBeGreaterThan(0);
    for (const record of records.lines) {
      expect(
        formatEdgeLabelLines(
          readLayout(record.layout),
          readEdge(record.edge),
          formatCount,
        ),
      ).toEqual(record.result);
    }
  });

  it("leaves an edge with no bundle to a bug, not a label", () => {
    const layout = readLayout("small");
    const edge = records.lines.at(0)?.edge;
    if (edge === undefined) throw new Error("no recorded edge");
    const { bundle: _, ...bare } = edge;
    expect(() =>
      formatEdgeLabelLines(layout, bare as LabelledEdge, formatCount),
    ).toThrow("bundle for a relation edge");
  });
});

describe("placeEdgeLabels", () => {
  it("places each recorded focus node's labels as the layout did", () => {
    expect(records.labels.length).toBeGreaterThan(0);
    for (const record of records.labels) {
      expect(
        placeEdgeLabels(
          readLayout(record.layout, record.viewBox),
          record.focus,
          new Set(record.faded),
          formatCount,
          formatClassCount,
        ),
      ).toEqual(record.result);
    }
  });

  it("places labels clear of each other, and leaves a crowded one omitted", () => {
    const placed = records.labels.flatMap((record) => record.result.placed);
    expect(placed.length).toBeGreaterThan(0);
    expect(records.labels.some((r) => r.result.omitted.length > 0)).toBe(true);
    for (const record of records.labels) {
      record.result.placed.forEach((label, index) => {
        for (const other of record.result.placed.slice(index + 1)) {
          const apart =
            label.box.x + label.box.w <= other.box.x ||
            other.box.x + other.box.w <= label.box.x ||
            label.box.y + label.box.h <= other.box.y ||
            other.box.y + other.box.h <= label.box.y;
          expect(apart).toBe(true);
        }
      });
    }
  });

  it("gives no label to an edge whose ends are faded", () => {
    const layout = readLayout("small");
    const faded = new Set(layout.nodes.keys());
    const focus = layout.nodes.keys().next().value ?? "";
    expect(
      placeEdgeLabels(layout, focus, faded, formatCount, formatClassCount),
    ).toEqual({ placed: [], omitted: [] });
  });

  it("is a pure function of its input", () => {
    const layout = readLayout("real");
    const focus = [...layout.nodes.keys()].at(0) ?? "";
    const place = (): LabelPlacement =>
      placeEdgeLabels(layout, focus, new Set(), formatCount, formatClassCount);
    expect(JSON.stringify(place())).toBe(JSON.stringify(place()));
  });
});
