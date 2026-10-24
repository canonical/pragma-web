import { describe, expect, it } from "vitest";
import { LATTICE_PITCH } from "#lib/graph";
import { BUTTON_TREE } from "../../../../../testing/anatomyTrees.js";
import {
  COLUMN_GAP,
  MARGIN,
  NODE_HEIGHT,
  NODE_WIDTH,
  ROW_PITCH,
} from "./constants.js";
import layoutAnatomyTree from "./layoutAnatomyTree.js";

const layout = layoutAnatomyTree(BUTTON_TREE);

/** The placed node of an id. */
const place = (id: string) => {
  const placed = layout.nodes.find((entry) => entry.node.id === id);
  if (placed === undefined) throw new Error(`${id} was not placed`);
  return placed;
};

describe("layoutAnatomyTree", () => {
  it("lays the same tree out the same way every time", () => {
    expect(layoutAnatomyTree(BUTTON_TREE)).toEqual(layout);
  });

  it("places every node, in pre-order, with every corner on the lattice", () => {
    expect(layout.nodes.map(({ node }) => node.id)).toEqual([
      "$root",
      "$root/global.component.icon",
      "$root/switch",
      "$root/case[text]",
      "$root/case[hidden]",
      "$root/spacer[1]",
      "$root/spacer[2]",
    ]);
    for (const { x, y } of layout.nodes) {
      expect(Number.isInteger(x) && x % LATTICE_PITCH === 0).toBe(true);
      expect(Number.isInteger(y) && y % LATTICE_PITCH === 0).toBe(true);
    }
  });

  it("sets each level of depth one column to the right, 240 units apart", () => {
    for (const { depth, x } of layout.nodes) {
      expect(x).toBe(MARGIN + depth * (NODE_WIDTH + COLUMN_GAP));
    }
    expect(NODE_WIDTH + COLUMN_GAP).toBe(240);
  });

  it("gives each leaf its own row and overlaps no two boxes", () => {
    const boxes = layout.nodes;
    for (const [index, a] of boxes.entries()) {
      for (const b of boxes.slice(index + 1)) {
        const apart =
          a.x + NODE_WIDTH <= b.x ||
          b.x + NODE_WIDTH <= a.x ||
          a.y + NODE_HEIGHT <= b.y ||
          b.y + NODE_HEIGHT <= a.y;
        expect(apart, `${a.node.id} and ${b.node.id}`).toBe(true);
      }
    }
    expect(place("$root/global.component.icon").y).toBe(MARGIN);
    expect(place("$root/case[text]").y).toBe(MARGIN + ROW_PITCH);
    expect(place("$root/spacer[2]").y).toBe(MARGIN + 4 * ROW_PITCH);
  });

  it("centres a parent on its children's rows, snapped to the lattice", () => {
    const parent = place("$root/switch");
    const first = place("$root/case[text]");
    const last = place("$root/case[hidden]");
    const centre = (first.y + last.y) / 2;
    expect(parent.y).toBeLessThanOrEqual(centre);
    expect(centre - parent.y).toBeLessThan(LATTICE_PITCH);
  });

  it("draws one orthogonal edge per child, only along and down", () => {
    expect(layout.edges).toHaveLength(layout.nodes.length - 1);
    for (const { d } of layout.edges) {
      expect(d).toMatch(/^M\d+ \d+H\d+V\d+H\d+$/);
    }
    const root = place("$root");
    const icon = place("$root/global.component.icon");
    expect(layout.edges.find((edge) => edge.id === icon.node.id)?.d).toBe(
      `M${root.x + NODE_WIDTH} ${root.y + NODE_HEIGHT / 2}H${root.x + NODE_WIDTH + COLUMN_GAP / 2}V${icon.y + NODE_HEIGHT / 2}H${icon.x}`,
    );
  });

  it("sizes the drawing to the tree's bounds with a margin on every side", () => {
    const right = Math.max(...layout.nodes.map(({ x }) => x + NODE_WIDTH));
    const bottom = Math.max(...layout.nodes.map(({ y }) => y + NODE_HEIGHT));
    const left = Math.min(...layout.nodes.map(({ x }) => x));
    const top = Math.min(...layout.nodes.map(({ y }) => y));
    expect(layout.width).toBe(right - left + 2 * MARGIN);
    expect(layout.height).toBe(bottom - top + 2 * MARGIN);
  });

  it("lays a lone root out on its own", () => {
    const lone = layoutAnatomyTree({
      id: "$root",
      label: "divider",
      form: "named",
      styleCount: 1,
      children: [],
    });
    expect(lone.nodes).toEqual([
      expect.objectContaining({ depth: 0, x: MARGIN, y: MARGIN }),
    ]);
    expect(lone.edges).toEqual([]);
    expect([lone.width, lone.height]).toEqual([
      NODE_WIDTH + 2 * MARGIN,
      NODE_HEIGHT + 2 * MARGIN,
    ]);
  });
});
