/**
 * The class graph's measurements, read from its layout with no browser:
 * fit, density, gaps, overlaps, crossings, ports and the phone view, as the
 * graph heuristics' reviewer measures them. The layout test pins them.
 */

import {
  BOX_INSET,
  COLLISION_MARGIN,
  DESIGN_CANVAS,
  LABEL_SIZE,
  PHONE,
  REGION_LABEL_GAP,
  REGION_LABEL_ROW,
  REGION_LABEL_SIZE,
  WRAPPED_BASELINES,
} from "../src/lib/classGraph/constants.js";
import {
  containsPoint,
  findCentredBaseline,
  flattenPath,
  insetRect,
  intersectsRect,
  measureTextBox,
  measureTextWidth,
  parsePathData,
  samplePath,
} from "../src/lib/classGraph/geometry.js";
import type {
  ClassGraphLayout,
  LaidOutNode,
  Point,
  Rect,
} from "../src/lib/classGraph/types.js";

/** A node's collision box: its box, 4px around, and its loop's extent. */
export function measureCollisionBox(node: LaidOutNode): Rect {
  return {
    x: node.x - COLLISION_MARGIN,
    y: node.y - COLLISION_MARGIN - node.loopExtent,
    w: node.w + 2 * COLLISION_MARGIN + node.loopExtent,
    h: node.h + 2 * COLLISION_MARGIN + node.loopExtent,
  };
}

/** The gap between two rectangles, 0 when they touch or overlap. */
export function measureRectGap(a: Rect, b: Rect): number {
  const dx = Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w));
  const dy = Math.max(0, a.y - (b.y + b.h), b.y - (a.y + a.h));
  return Math.hypot(dx, dy);
}

/** The median of a list of numbers. */
export function findMedian(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted.at(middle) ?? 0)
    : ((sorted.at(middle - 1) ?? 0) + (sorted.at(middle) ?? 0)) / 2;
}

/** The fit zoom on the design canvas, and the fill of the axis that does not bind. */
export function measureFit(layout: ClassGraphLayout): {
  readonly zoom: number;
  readonly binding: "width" | "height";
  readonly otherFill: number;
} {
  const { w, h } = layout.viewBox;
  const zoom = Math.min(DESIGN_CANVAS.w / w, DESIGN_CANVAS.h / h);
  const binding =
    DESIGN_CANVAS.w / w <= DESIGN_CANVAS.h / h ? "width" : "height";
  return {
    zoom,
    binding,
    otherFill:
      binding === "height"
        ? (w * zoom) / DESIGN_CANVAS.w
        : (h * zoom) / DESIGN_CANVAS.h,
  };
}

/** The share of the design canvas the boxes cover at the fit zoom. */
export function measureAreaRatio(layout: ClassGraphLayout): number {
  const { zoom } = measureFit(layout);
  const area = [...layout.nodes.values()].reduce(
    (sum, node) => sum + node.w * node.h,
    0,
  );
  return (area * zoom * zoom) / (DESIGN_CANVAS.w * DESIGN_CANVAS.h);
}

/** How many cells of a 4 by 4 grid over the canvas hold no part of a box. */
export function countEmptyCells(layout: ClassGraphLayout): number {
  const { zoom } = measureFit(layout);
  const { x, y } = layout.viewBox;
  const boxes = [...layout.nodes.values()].map((node) => ({
    x: (node.x - x) * zoom,
    y: (node.y - y) * zoom,
    w: node.w * zoom,
    h: node.h * zoom,
  }));
  let empty = 0;
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const cell = {
        x: (column * DESIGN_CANVAS.w) / 4,
        y: (row * DESIGN_CANVAS.h) / 4,
        w: DESIGN_CANVAS.w / 4,
        h: DESIGN_CANVAS.h / 4,
      };
      if (!boxes.some((box) => intersectsRect(box, cell))) empty += 1;
    }
  }
  return empty;
}

/** The nodes of one region's column, top first. */
function listColumn(
  layout: ClassGraphLayout,
  region: string,
  column: number,
): LaidOutNode[] {
  return [...layout.nodes.values()]
    .filter((node) => node.region === region && node.col === column)
    .sort((a, b) => a.y - b.y);
}

/** The gaps between boxes within a column, and the least gap between adjacent columns. */
export function measureGaps(layout: ClassGraphLayout): {
  readonly withinColumns: readonly number[];
  readonly betweenColumns: number;
  readonly medianNearest: number;
  readonly interRegion: number;
  readonly intraRegionMedian: number;
} {
  const within = new Set<number>();
  const between: number[] = [];
  for (const region of layout.regions) {
    for (let column = 0; column < region.columns; column += 1) {
      const stack = listColumn(layout, region.prefix, column);
      const next = listColumn(layout, region.prefix, column + 1);
      for (let index = 1; index < stack.length; index += 1) {
        const above = stack.at(index - 1);
        const below = stack.at(index);
        if (above !== undefined && below !== undefined) {
          within.add(below.y - below.loopExtent - (above.y + above.h));
        }
      }
      const nextX = next.at(0)?.x;
      if (nextX !== undefined) {
        between.push(
          Math.min(
            ...stack.map((node) => nextX - (node.x + node.w + node.loopExtent)),
          ),
        );
      }
    }
  }
  const nodes = [...layout.nodes.values()];
  const nearest = nodes.map((node) =>
    Math.min(
      ...nodes
        .filter((other) => other !== node)
        .map((other) => measureRectGap(node, other)),
    ),
  );
  const nearestIntra = nodes.map((node) =>
    Math.min(
      ...nodes
        .filter((other) => other !== node && other.region === node.region)
        .map((other) => measureRectGap(node, other)),
    ),
  );
  let interRegion = Number.POSITIVE_INFINITY;
  for (const node of nodes) {
    for (const other of nodes) {
      if (node.region !== other.region) {
        interRegion = Math.min(interRegion, measureRectGap(node, other));
      }
    }
  }
  return {
    withinColumns: [...within].sort((a, b) => a - b),
    betweenColumns: Math.min(...between),
    medianNearest: findMedian(nearest),
    interRegion,
    intraRegionMedian: findMedian(nearestIntra),
  };
}

/** The em boxes of a node's label lines and count. */
export function measureNodeTexts(node: LaidOutNode): Rect[] {
  if (node.lines.length > 1) {
    return node.lines.map((line, index) =>
      measureTextBox(
        node.x + BOX_INSET,
        node.y + (WRAPPED_BASELINES.at(index) ?? 0),
        measureTextWidth(line, node.face, node.size),
        node.size,
      ),
    );
  }
  const baseline = node.y + findCentredBaseline(node.h, node.size);
  const boxes = [
    measureTextBox(
      node.x + BOX_INSET,
      baseline,
      measureTextWidth(node.label, node.face, node.size),
      node.size,
    ),
  ];
  if (node.count !== null) {
    const width = measureTextWidth(node.count, "regular", LABEL_SIZE, true);
    boxes.push(
      measureTextBox(
        node.x + node.w - BOX_INSET - width,
        baseline,
        width,
        LABEL_SIZE,
      ),
    );
  }
  return boxes;
}

/** The em boxes of each region's label row. */
export function measureRegionTexts(layout: ClassGraphLayout): Rect[] {
  return layout.regions.flatMap((region) => {
    const baseline =
      region.y + findCentredBaseline(REGION_LABEL_ROW, REGION_LABEL_SIZE);
    const prefixWidth = measureTextWidth(
      region.prefix.toUpperCase(),
      "bold",
      REGION_LABEL_SIZE,
    );
    return [
      measureTextBox(region.x, baseline, prefixWidth, REGION_LABEL_SIZE),
      measureTextBox(
        region.x + prefixWidth + REGION_LABEL_GAP,
        baseline,
        measureTextWidth(`${region.ids.length} classes`, "regular", LABEL_SIZE),
        LABEL_SIZE,
      ),
    ];
  });
}

/** The three overlap counts at rest: collision boxes, edges through boxes, texts. */
export function countOverlaps(layout: ClassGraphLayout): {
  readonly collisions: number;
  readonly edgesThroughBoxes: readonly string[];
  readonly textOverlaps: number;
} {
  const nodes = [...layout.nodes.values()];
  let collisions = 0;
  nodes.forEach((node, index) => {
    for (const other of nodes.slice(index + 1)) {
      if (intersectsRect(measureCollisionBox(node), measureCollisionBox(other)))
        collisions += 1;
    }
  });
  const edgesThroughBoxes = layout.edges.flatMap((edge) => {
    const ends = new Set([edge.from, ...edge.to]);
    const samples = [edge.d, ...edge.heads].flatMap((d) => samplePath(d, 4));
    const hit = nodes.filter(
      (node) =>
        !ends.has(node.uri) &&
        samples.some((sample) =>
          containsPoint(sample, insetRect(measureCollisionBox(node), 2)),
        ),
    );
    return hit.length > 0
      ? [`${edge.id} through ${hit.map((node) => node.label).join(", ")}`]
      : [];
  });
  const texts = [
    ...nodes.flatMap((node) =>
      measureNodeTexts(node).map((box) => ({ box, owner: node.uri })),
    ),
    ...measureRegionTexts(layout).map((box) => ({ box, owner: "" })),
  ];
  let textOverlaps = 0;
  texts.forEach((text, index) => {
    for (const other of texts.slice(index + 1)) {
      if (intersectsRect(text.box, other.box)) textOverlaps += 1;
    }
    for (const node of nodes) {
      if (
        node.uri !== text.owner &&
        intersectsRect(text.box, measureCollisionBox(node))
      ) {
        textOverlaps += 1;
      }
    }
  });
  return { collisions, edgesThroughBoxes, textOverlaps };
}

/** The proper intersection of two segments, or `undefined`. */
function crossSegments(
  a: Point,
  b: Point,
  c: Point,
  d: Point,
): { x: number; y: number; angle: number } | undefined {
  const r = [b[0] - a[0], b[1] - a[1]] as const;
  const s = [d[0] - c[0], d[1] - c[1]] as const;
  const denominator = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(denominator) < 1e-9) return undefined;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / denominator;
  const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / denominator;
  const epsilon = 1e-6;
  if (t <= epsilon || t >= 1 - epsilon || u <= epsilon || u >= 1 - epsilon)
    return undefined;
  const cosine = Math.abs(
    (r[0] * s[0] + r[1] * s[1]) / (Math.hypot(...r) * Math.hypot(...s)),
  );
  return {
    x: a[0] + t * r[0],
    y: a[1] + t * r[1],
    angle: (Math.acos(Math.min(1, cosine)) * 180) / Math.PI,
  };
}

/** The crossings of a layout's edges: interior only, curves in 16 segments. */
export function countCrossings(layout: ClassGraphLayout): {
  readonly total: number;
  readonly subclass: number;
  readonly relationPaths: number;
  readonly minAngle: number;
} {
  const polylines = layout.edges.map((edge) => ({
    edge,
    lines: flattenPath(edge.d, 16),
  }));
  let total = 0;
  let subclass = 0;
  let minAngle = 90;
  polylines.forEach((first, index) => {
    for (const second of polylines.slice(index + 1)) {
      const ends = [...first.lines, ...second.lines].flatMap((line) => [
        line.at(0),
        line.at(-1),
      ]);
      const found: { x: number; y: number; angle: number }[] = [];
      for (const a of first.lines) {
        for (const b of second.lines) {
          for (let i = 1; i < a.length; i += 1) {
            for (let j = 1; j < b.length; j += 1) {
              const [a0, a1, b0, b1] = [
                a.at(i - 1),
                a.at(i),
                b.at(j - 1),
                b.at(j),
              ];
              if (
                a0 === undefined ||
                a1 === undefined ||
                b0 === undefined ||
                b1 === undefined
              )
                continue;
              const crossing = crossSegments(a0, a1, b0, b1);
              if (
                crossing !== undefined &&
                !ends.some(
                  (end) =>
                    end !== undefined &&
                    Math.hypot(end[0] - crossing.x, end[1] - crossing.y) <= 2,
                ) &&
                !found.some(
                  (other) =>
                    Math.hypot(other.x - crossing.x, other.y - crossing.y) <
                    0.5,
                )
              ) {
                found.push(crossing);
              }
            }
          }
        }
      }
      total += found.length;
      if (first.edge.kind === "subclass" && second.edge.kind === "subclass")
        subclass += found.length;
      for (const crossing of found)
        minAngle = Math.min(minAngle, crossing.angle);
    }
  });
  return {
    total,
    subclass,
    relationPaths: layout.edges.filter((edge) => edge.kind === "relation")
      .length,
    minAngle,
  };
}

/** The least port spacing, corner distance and tick distances on any box side. */
export function measurePorts(layout: ClassGraphLayout): {
  readonly spacing: number;
  readonly corner: number;
  readonly tickOnHub: number;
  readonly tickElsewhere: number;
} {
  const sides = new Map<
    string,
    { node: LaidOutNode; relation: number[]; tick: number[] }
  >();
  for (const edge of layout.edges) {
    for (const { start, segments } of parsePathData(edge.d)) {
      const end = segments.at(-1)?.points.at(-1) ?? start;
      for (const [x, y] of [start, end]) {
        for (const node of layout.nodes.values()) {
          const onLeft = Math.abs(x - node.x) < 0.5;
          const onRight = Math.abs(x - (node.x + node.w)) < 0.5;
          if (
            !(onLeft || onRight) ||
            y < node.y - 0.5 ||
            y > node.y + node.h + 0.5
          )
            continue;
          const key = `${node.uri} ${onLeft ? "left" : "right"}`;
          const side = sides.get(key) ?? { node, relation: [], tick: [] };
          (edge.kind === "subclass" ? side.tick : side.relation).push(
            y - node.y,
          );
          sides.set(key, side);
        }
      }
    }
  }
  let spacing = Number.POSITIVE_INFINITY;
  let corner = Number.POSITIVE_INFINITY;
  let tickOnHub = Number.POSITIVE_INFINITY;
  let tickElsewhere = Number.POSITIVE_INFINITY;
  for (const { node, relation, tick } of sides.values()) {
    const all = [...new Set([...relation, ...tick])].sort((a, b) => a - b);
    for (let index = 1; index < all.length; index += 1) {
      spacing = Math.min(
        spacing,
        (all.at(index) ?? 0) - (all.at(index - 1) ?? 0),
      );
    }
    for (const y of relation) {
      corner = Math.min(corner, y, node.h - y);
      for (const line of tick) {
        if (node.hub) tickOnHub = Math.min(tickOnHub, Math.abs(y - line));
        else tickElsewhere = Math.min(tickElsewhere, Math.abs(y - line));
      }
    }
  }
  return { spacing, corner, tickOnHub, tickElsewhere };
}

/** How many arrowhead tips touch one of their edge's boxes, of how many. */
export function countTouchingTips(layout: ClassGraphLayout): {
  readonly touching: number;
  readonly total: number;
} {
  let touching = 0;
  let total = 0;
  for (const edge of layout.edges) {
    for (const head of edge.heads) {
      const [x, y] = parsePathData(head).at(0)?.start ?? [0, 0];
      total += 1;
      const touches = [edge.from, ...edge.to].some((id) => {
        const node = layout.nodes.get(id);
        return (
          node !== undefined &&
          (Math.abs(x - node.x) <= 1 || Math.abs(x - node.x - node.w) <= 1) &&
          y >= node.y &&
          y <= node.y + node.h
        );
      });
      if (touches) touching += 1;
    }
  }
  return { touching, total };
}

/** Whether every column's top-to-bottom order is the rail's order. */
export function followsRailOrder(layout: ClassGraphLayout): boolean {
  return layout.regions.every((region) =>
    Array.from({ length: region.columns }, (_, column) => column).every(
      (column) => {
        const stack = listColumn(layout, region.prefix, column);
        const byRail = [...stack].sort((a, b) => a.railIndex - b.railIndex);
        return stack.every((node, index) => byRail.at(index) === node);
      },
    ),
  );
}

/** The phone view's checks: width, rail order, collisions, arcs through rows and spine ports. */
export function measurePhone(layout: ClassGraphLayout): {
  readonly maxX: number;
  readonly inRailOrder: boolean;
  readonly collisions: number;
  readonly arcsThroughRows: number;
  readonly maxSpinePorts: number;
} {
  const { rows, edges } = layout.phone;
  const ordered = [...rows.values()].sort((a, b) => a.y - b.y);
  const inRailOrder = ordered.every(
    (row, index) =>
      index === 0 ||
      (layout.nodes.get(row.id)?.railIndex ?? 0) >
        (layout.nodes.get(ordered.at(index - 1)?.id ?? "")?.railIndex ?? 0),
  );
  const boxOf = (id: string): Rect => {
    const row = rows.get(id);
    if (row === undefined) throw new Error(`no phone row for ${id}`);
    return { x: row.x - 4, y: row.y - 4, w: row.w + 8, h: row.h + 8 };
  };
  let collisions = 0;
  ordered.forEach((row, index) => {
    for (const other of ordered.slice(index + 1)) {
      if (intersectsRect(boxOf(row.id), boxOf(other.id))) collisions += 1;
    }
  });
  let arcsThroughRows = 0;
  for (const edge of edges) {
    const samples = samplePath(edge.d, 4);
    for (const row of ordered) {
      if (row.id === edge.from || edge.to.includes(row.id)) continue;
      if (
        samples.some((sample) =>
          containsPoint(sample, insetRect(boxOf(row.id), 2)),
        )
      )
        arcsThroughRows += 1;
    }
  }
  const ports = new Map<string, Set<number>>();
  for (const edge of edges) {
    for (const { start, segments } of parsePathData(edge.d)) {
      const end = segments.at(-1)?.points.at(-1) ?? start;
      for (const [x, y] of [start, end]) {
        if (x !== PHONE.spine) continue;
        const row = ordered.find(
          (candidate) => y >= candidate.y && y <= candidate.y + candidate.h,
        );
        if (row === undefined) continue;
        ports.set(row.id, new Set([...(ports.get(row.id) ?? []), y - row.y]));
      }
    }
  }
  const maxX = Math.max(
    ...ordered.map((row) => row.x + row.w),
    ...edges.flatMap((edge) =>
      flattenPath(edge.d, 16)
        .flat()
        .map(([x]) => x),
    ),
  );
  return {
    maxX,
    inRailOrder,
    collisions,
    arcsThroughRows,
    maxSpinePorts: Math.max(...[...ports.values()].map((set) => set.size)),
  };
}
