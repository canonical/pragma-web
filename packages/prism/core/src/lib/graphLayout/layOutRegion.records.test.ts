import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import layOutRegion from "./layOutRegion.js";
import layoutLayered from "./layoutLayered.js";
import type {
  CrossPort,
  GraphLayout,
  LayeredBundle,
  LayeredModel,
  LayeredNode,
  RegionLayout,
} from "./types.js";

/** One recorded region: what the layout read and what it returned. */
interface RegionRecord {
  readonly input: {
    readonly model: {
      readonly byId: readonly [string, LayeredNode][];
      readonly parent: readonly [string, string][];
      readonly crossParent: readonly [string, string][];
      readonly children: readonly [string, readonly string[]][];
      readonly bundles: readonly (Omit<LayeredBundle, "heads"> & {
        readonly heads: readonly string[];
      })[];
      readonly drawnRelations: LayeredModel["drawnRelations"];
    };
    readonly ids: readonly string[];
    readonly channel: number;
    readonly sweeps: number;
    readonly crossPorts: readonly [string, CrossPort][];
  };
  readonly output: unknown;
}

/**
 * Read the recorded regions beside this test, located from vitest's
 * `testPath`, since `import.meta.url` is not a file URL under jsdom.
 */
function readRecords(): readonly RegionRecord[] {
  const testPath = expect.getState().testPath;
  if (typeof testPath !== "string") {
    throw new Error("vitest did not expose the current test path");
  }
  return JSON.parse(
    readFileSync(join(dirname(testPath), "layOutRegion.records.json"), "utf8"),
  ) as readonly RegionRecord[];
}

/** Rebuild a recorded model's maps and sets. */
function readModel(record: RegionRecord): LayeredModel {
  const { model } = record.input;
  return {
    byId: new Map(model.byId),
    parent: new Map(model.parent),
    crossParent: new Map(model.crossParent),
    children: new Map(model.children),
    bundles: model.bundles.map((bundle) => ({
      ...bundle,
      heads: new Set(bundle.heads),
    })),
    drawnRelations: model.drawnRelations,
  };
}

/** A layout as plain data, its bundles by id and its readers applied. */
function describeLayout(layout: RegionLayout, ids: readonly string[]): unknown {
  return {
    nodes: [...layout.nodes],
    edges: layout.edges.map(({ bundle, ...edge }) => ({
      ...edge,
      bundle: bundle?.id,
    })),
    columns: layout.columns,
    columnX: layout.columnX,
    columnWidth: layout.columnWidth,
    ports: [...layout.ports],
    content: layout.content,
    findings: layout.findings,
    crowdedArcs: layout.crowdedArcs,
    columnOf: ids.map((id) => layout.columnOf(id)),
    depthOf: ids.map((id) => layout.depthOf(id)),
    predecessorsOf: ids.map((id) => layout.predecessorsOf(id)),
  };
}

describe("layOutRegion over recorded regions", () => {
  const records = readRecords();

  it("returns the recorded layout of every region", () => {
    for (const record of records) {
      const { ids, channel, sweeps, crossPorts } = record.input;
      const layout = layOutRegion(
        readModel(record),
        ids,
        channel,
        sweeps,
        new Map(crossPorts),
      );
      expect(JSON.parse(JSON.stringify(describeLayout(layout, ids)))).toEqual(
        record.output,
      );
    }
  });

  it("lays out the same input byte for byte twice", () => {
    for (const record of records) {
      const { ids, channel, sweeps, crossPorts } = record.input;
      const lay = () =>
        describeLayout(
          layOutRegion(
            readModel(record),
            ids,
            channel,
            sweeps,
            new Map(crossPorts),
          ),
          ids,
        );
      const first = lay();
      expect(lay()).toEqual(first);
      expect(JSON.stringify(lay())).toBe(JSON.stringify(first));
    }
  });
});

describe("layoutLayered", () => {
  it("implements the graph layout contract over layOutRegion", () => {
    const kind: GraphLayout = layoutLayered;
    for (const record of readRecords()) {
      const { ids, channel, sweeps, crossPorts } = record.input;
      const model = readModel(record);
      const layout = kind(model, model, {
        ids,
        channel,
        sweeps,
        crossPorts: new Map(crossPorts),
      });
      expect(JSON.parse(JSON.stringify(describeLayout(layout, ids)))).toEqual(
        record.output,
      );
    }
  });

  it("defaults the cross-region ports to none", () => {
    const [record] = readRecords();
    if (record === undefined) throw new Error("no recorded region");
    const { ids, channel, sweeps } = record.input;
    const model = readModel(record);
    expect(
      describeLayout(
        layoutLayered(model, model, { ids, channel, sweeps }),
        ids,
      ),
    ).toEqual(describeLayout(layOutRegion(model, ids, channel, sweeps), ids));
  });
});
