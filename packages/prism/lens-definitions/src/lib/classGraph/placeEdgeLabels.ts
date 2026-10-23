import {
  COLLISION_MARGIN,
  LABEL_BESIDE_AT,
  LABEL_CENTRED_AT,
  LABEL_HALO,
  LABEL_LINE_PITCH,
  LABEL_OFFSET,
  LABEL_SIZE,
  REGION_LABEL_GAP,
  REGION_LABEL_ROW,
  REGION_LABEL_SIZE,
} from "./constants.js";
import formatEdgeLabelLines from "./formatEdgeLabelLines.js";
import {
  compareText,
  findPointOnPath,
  intersectsRect,
  measureTextWidth,
  orderBy,
} from "./geometry.js";
import { requireAt, requireDefined, requireEntry } from "./require.js";
import type {
  ClassGraphLayout,
  LabelPlacement,
  LaidOutNode,
  LaidOutRegion,
  PlacedLabel,
  Rect,
} from "./types.js";

/** A node's collision box: its box, 4px around, and its loop's extent. */
function measureCollisionBox(node: LaidOutNode): Rect {
  return {
    x: node.x - COLLISION_MARGIN,
    y: node.y - COLLISION_MARGIN - node.loopExtent,
    w: node.w + 2 * COLLISION_MARGIN + node.loopExtent,
    h: node.h + 2 * COLLISION_MARGIN + node.loopExtent,
  };
}

/** The box a label's lines take with their halo, centred on (`cx`, `cy`). */
function measureLabelBox(
  lines: readonly string[],
  cx: number,
  cy: number,
): Rect {
  const w =
    Math.max(
      ...lines.map((line) => measureTextWidth(line, "regular", LABEL_SIZE)),
    ) +
    2 * LABEL_HALO;
  const h = lines.length * LABEL_LINE_PITCH + 2 * LABEL_HALO;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** The box a region's label row's text takes: its prefix and its count. */
function measureRegionLabel(region: LaidOutRegion, classCount: string): Rect {
  return {
    x: region.x,
    y: region.y,
    w:
      measureTextWidth(region.prefix.toUpperCase(), "bold", REGION_LABEL_SIZE) +
      REGION_LABEL_GAP +
      measureTextWidth(classCount, "regular", LABEL_SIZE),
    h: REGION_LABEL_ROW,
  };
}

/**
 * Place the labels of a focus class's relation edges, deterministically:
 * a loop's first, by the loop; then each edge's at t = 0.5, 0.35 and 0.65
 * along it, centred, then 12px above or below the points at 0.5, 0.35,
 * 0.65, 0.2 and 0.8, then beside a same-column arc's apex, then above or
 * below each end box (the range end first), flush with the side the edge
 * leaves from. The first position that stays inside the viewBox and clears
 * every unfaded box, every region's label and every label already placed
 * wins; an edge whose label finds none is left to the inspector. An edge
 * that is not drawn, its source or every target faded or hidden, gets no
 * label.
 *
 * @param layout - The class graph's layout.
 * @param focus - The focus class's IRI.
 * @param faded - The classes not drawn at full strength: outside the
 *   focus's neighbourhood, or hidden by the filter.
 * @param formatCount - How "‹n› relations" reads, from the catalog.
 * @param formatClassCount - How a region's "‹n› classes" reads.
 * @returns The placed and the omitted labels.
 */
export default function placeEdgeLabels(
  layout: ClassGraphLayout,
  focus: string,
  faded: ReadonlySet<string>,
  formatCount: (count: number) => string,
  formatClassCount: (count: number) => string,
): LabelPlacement {
  const visible = [...layout.nodes.values()].filter(
    (node) => !faded.has(node.uri),
  );
  const obstacles = visible.map(measureCollisionBox);
  const texts = layout.regions.map((region) =>
    measureRegionLabel(region, formatClassCount(region.ids.length)),
  );
  const { viewBox } = layout;
  const placed: PlacedLabel[] = [];
  const omitted: { edge: string; lines: string[] }[] = [];
  const edges = layout.edges
    .filter(
      (edge) =>
        edge.kind === "relation" &&
        (edge.from === focus || edge.to.includes(focus)) &&
        !faded.has(edge.from) &&
        !edge.to.every((id) => faded.has(id)),
    )
    .sort((a, b) =>
      orderBy(
        Number(b.self === true) - Number(a.self === true),
        compareText(a.id, b.id),
      ),
    );
  for (const edge of edges) {
    const lines = formatEdgeLabelLines(layout, edge, formatCount);
    const size = measureLabelBox(lines, 0, 0);
    const candidates: { cx: number; cy: number }[] = [];
    if (edge.self === true && edge.apex !== undefined) {
      const box = measureCollisionBox(requireEntry(layout.nodes, edge.from));
      const [apexX, apexY] = edge.apex;
      candidates.push(
        { cx: apexX + 4 + size.w / 2, cy: apexY },
        { cx: apexX, cy: box.y - 4 - size.h / 2 },
        { cx: apexX, cy: box.y + box.h + 4 + size.h / 2 },
      );
    }
    for (const t of LABEL_CENTRED_AT) {
      const [cx, cy] = findPointOnPath(edge.d, t);
      candidates.push({ cx, cy });
    }
    for (const t of LABEL_BESIDE_AT) {
      const [cx, cy] = findPointOnPath(edge.d, t);
      candidates.push(
        { cx, cy: cy - LABEL_OFFSET },
        { cx, cy: cy + LABEL_OFFSET },
      );
    }
    if (edge.arc === true && edge.apex !== undefined) {
      candidates.push({ cx: edge.apex[0] + 4 + size.w / 2, cy: edge.apex[1] });
    }
    if (edge.self !== true) {
      const a = requireEntry(layout.nodes, edge.from);
      const b = requireEntry(layout.nodes, requireAt(edge.to, 0));
      const { heads } = requireDefined(
        edge.bundle,
        "bundle for a relation edge",
      );
      const ends = [a, b].sort(
        (x, y) => Number(heads.has(y.uri)) - Number(heads.has(x.uri)),
      );
      for (const end of ends) {
        const other = end === a ? b : a;
        const box = measureCollisionBox(end);
        const flushRight =
          end.col === other.col ||
          end.region !== other.region ||
          end.x < other.x;
        const cx = flushRight
          ? Math.floor(end.x + end.w - size.w / 2)
          : Math.ceil(end.x + size.w / 2);
        candidates.push(
          { cx, cy: Math.floor(box.y - size.h / 2) },
          { cx, cy: Math.ceil(box.y + box.h + size.h / 2) },
        );
      }
    }
    const chosen = candidates
      .map(({ cx, cy }) => ({ cx: Math.round(cx), cy: Math.round(cy) }))
      .map(({ cx, cy }) => ({ cx, cy, box: measureLabelBox(lines, cx, cy) }))
      .find(
        ({ box }) =>
          box.x >= viewBox.x &&
          box.y >= viewBox.y &&
          box.x + box.w <= viewBox.x + viewBox.w &&
          box.y + box.h <= viewBox.y + viewBox.h &&
          !obstacles.some((obstacle) => intersectsRect(obstacle, box)) &&
          !texts.some((text) => intersectsRect(text, box)) &&
          !placed.some((label) => intersectsRect(label.box, box)),
      );
    if (chosen === undefined) omitted.push({ edge: edge.id, lines });
    else placed.push({ edge: edge.id, lines, ...chosen });
  }
  return { placed, omitted };
}
