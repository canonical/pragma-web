import { snapToLattice } from "#lib/graph";
import {
  COLUMN_GAP,
  MARGIN,
  NODE_HEIGHT,
  NODE_WIDTH,
  ROW_PITCH,
} from "./constants.js";
import type {
  AnatomyTreeLayout,
  AnatomyTreeNode,
  PlacedAnatomyNode,
} from "./types.js";

/** The distance from one column of depth to the next. */
const COLUMN_PITCH = NODE_WIDTH + COLUMN_GAP;

/** A subtree at its place: its own node's place, every place, the next free row. */
interface PlacedSubtree {
  readonly self: PlacedAnatomyNode;
  readonly placed: readonly PlacedAnatomyNode[];
  readonly next: number;
}

/**
 * Place a node and its subtree: leaves take the next free row, in
 * pre-order, and a parent stands on the middle of its first and last
 * children's rows, snapped down to the lattice.
 */
function placeSubtree(
  node: AnatomyTreeNode,
  depth: number,
  row: number,
): PlacedSubtree {
  const x = MARGIN + depth * COLUMN_PITCH;
  const subtrees: PlacedSubtree[] = [];
  let next = row;
  for (const child of node.children) {
    const subtree = placeSubtree(child, depth + 1, next);
    subtrees.push(subtree);
    next = subtree.next;
  }
  const first = subtrees.at(0);
  const last = subtrees.at(-1);
  if (first === undefined || last === undefined) {
    const self = { node, depth, x, y: MARGIN + row * ROW_PITCH };
    return { self, placed: [self], next: row + 1 };
  }
  const self = {
    node,
    depth,
    x,
    y: snapToLattice((first.self.y + last.self.y) / 2),
  };
  return {
    self,
    placed: [self, ...subtrees.flatMap((subtree) => subtree.placed)],
    next,
  };
}

/**
 * Draw the orthogonal path from a parent to one of its children: along
 * from the parent's right middle to a bus half a column gap away, down the
 * bus, then along to the child's left middle.
 */
function drawEdge(parent: PlacedAnatomyNode, child: PlacedAnatomyNode): string {
  const startX = parent.x + NODE_WIDTH;
  const busX = startX + COLUMN_GAP / 2;
  const startY = parent.y + NODE_HEIGHT / 2;
  const endY = child.y + NODE_HEIGHT / 2;
  return `M${startX} ${startY}H${busX}V${endY}H${child.x}`;
}

/**
 * Lay a UI block's anatomy out as a tree: the root on the left and each
 * level of depth one column to the right, 240 units apart; leaves one row
 * each, 64 units apart, in the anatomy's order; a parent centred on its
 * children's rows. Every coordinate is an integer, every top-left corner a
 * multiple of the 16-unit lattice, and the same tree always lays out the
 * same way.
 *
 * @param tree - The anatomy, as `buildAnatomyTree` reads it.
 * @returns The placed nodes, one orthogonal edge per child, and the
 *   drawing's size: the tree's bounds with a margin on every side.
 */
export default function layoutAnatomyTree(
  tree: AnatomyTreeNode,
): AnatomyTreeLayout {
  const { placed } = placeSubtree(tree, 0, 0);
  const byId = new Map(placed.map((entry) => [entry.node.id, entry]));
  const edges = placed.flatMap((parent) =>
    parent.node.children.map((child) => {
      const target = byId.get(child.id);
      if (target === undefined) {
        throw new Error(`layoutAnatomyTree: ${child.id} was never placed`);
      }
      return { id: child.id, d: drawEdge(parent, target) };
    }),
  );
  const right = Math.max(...placed.map((entry) => entry.x + NODE_WIDTH));
  const bottom = Math.max(...placed.map((entry) => entry.y + NODE_HEIGHT));
  return {
    nodes: placed,
    edges,
    width: right + MARGIN,
    height: bottom + MARGIN,
  };
}
