import { describe, expect, it } from "vitest";
import { formatPathData, parsePathData } from "./geometry.js";
import layoutLayered from "./layoutLayered.js";
import type { LayeredModel, LayeredNode } from "./types.js";

/** A class box as the layout reads it: 96 by 32, no loop. */
const BOX: LayeredNode = {
  label: "",
  w: 96,
  h: 32,
  hub: false,
  loop: false,
  loopExtent: 0,
};

/**
 * A tree: a root `r` with `size` subclasses `c00`, `c01`, ..., and under
 * the first subclass one more, `g`.
 */
function defineTree(size: number): LayeredModel {
  const children = Array.from(
    { length: size },
    (_, index) => `c${String(index).padStart(2, "0")}`,
  );
  const ids = ["r", ...children, "g"];
  return {
    byId: new Map(ids.map((id) => [id, { ...BOX, label: id }])),
    parent: new Map([
      ...children.map((child): [string, string] => [child, "r"]),
      ["g", "c00"],
    ]),
    crossParent: new Map(),
    children: new Map([
      ["r", children],
      ["c00", ["g"]],
    ]),
    bundles: [],
    drawnRelations: [],
  };
}

/** Lay a tree's every class out, with the band limit given. */
function layOut(model: LayeredModel, bandMembersMax?: number) {
  return layoutLayered(model, model, {
    ids: [...model.byId.keys()],
    channel: 48,
    sweeps: 4,
    ...(bandMembersMax === undefined ? {} : { bandMembersMax }),
  });
}

/** Each column's classes, in order, waypoint slots left out. */
function listColumns(model: LayeredModel, bandMembersMax?: number) {
  return layOut(model, bandMembersMax).columns.map((stack) =>
    stack.filter((id) => model.byId.has(id)),
  );
}

describe("layoutLayered's band limit", () => {
  it("leaves a layer whole when no limit is set, or when it holds no more than the limit", () => {
    const model = defineTree(14);
    expect(listColumns(model).map((column) => column.length)).toEqual([
      1, 14, 1,
    ]);
    const { nodes, edges, columns } = layOut(model);
    expect(layOut(model, 14)).toMatchObject({ nodes, edges, columns });
  });

  it("splits a layer of more members than the limit into balanced consecutive columns, in pre-order", () => {
    const model = defineTree(14);
    // Fourteen subclasses in two columns of seven, the next layer one
    // column further right; the sweeps then order each column's own.
    const columns = listColumns(model, 12).map((column) => column.sort());
    expect(columns).toEqual([
      ["r"],
      ["c00", "c01", "c02", "c03", "c04", "c05", "c06"],
      ["c07", "c08", "c09", "c10", "c11", "c12", "c13"],
      ["g"],
    ]);
    expect(
      listColumns(defineTree(13), 6).map((column) => column.length),
    ).toEqual([1, 5, 4, 4, 1]);
  });

  it("reaches every subclass a split moved on, through a slot of each column between, crossing no box", () => {
    const layout = layOut(defineTree(14), 12);
    const buses = layout.edges.filter((edge) => edge.kind === "subclass");
    expect(buses.map((bus) => [bus.id, bus.to.length])).toEqual([
      ["sub:r", 14],
      ["sub:c00", 1],
    ]);
    for (const bus of buses) {
      const runs = parsePathData(formatPathData(bus.commands)).flatMap(
        ({ segments }) => segments,
      );
      // Each subclass is entered at the middle of its left side.
      for (const child of bus.to) {
        const node = layout.nodes.get(child);
        expect(
          runs.some(
            ({ points: [, to] }) =>
              to?.[0] === node?.x && to?.[1] === (node?.y ?? 0) + BOX.h / 2,
          ),
        ).toBe(true);
      }
      for (const node of layout.nodes.values()) {
        for (const {
          points: [from, to],
        } of runs) {
          if (from === undefined || to === undefined) continue;
          expect(
            Math.min(from[0], to[0]) < node.x + node.w &&
              node.x < Math.max(from[0], to[0]) &&
              Math.min(from[1], to[1]) < node.y + node.h &&
              node.y < Math.max(from[1], to[1]),
          ).toBe(false);
        }
      }
    }
  });
});
