import {
  ARC_BASE,
  ARC_NEST,
  BOX_HEIGHT,
  COLLISION_MARGIN,
  PHONE,
  ROUTE_STEP,
} from "./constants.js";
import {
  buildArrowhead,
  compareText,
  containsPoint,
  formatPathData,
  insetRect,
  orderBy,
  samplePath,
} from "./geometry.js";
import { requireAt, requireEntry } from "./require.js";
import type {
  ClassGraphModel,
  LaidOutEdge,
  LaidOutNode,
  PathCommand,
  PhoneLayout,
  PhoneRow,
  Point,
  Rect,
} from "./types.js";

/**
 * Lay the class graph out for a phone: a 358px column, each region a header
 * row and then one row per class in rail order on a 48px pitch, each box
 * indented 16px per depth and running to the spine, the subclass structure
 * drawn as the indent and a guide at each parent's indent, the relations
 * as arcs right of the spine nested by span. At each row the arcs that
 * arrive (the end is some relation's range) share the in-port and the
 * others the out-port, so a row carries at most two spine ports; a
 * self-loop leaves at the out-port and returns to the in-port.
 *
 * @param model - The class graph's model.
 * @param nodes - The desktop layout's nodes, for depth and region.
 * @param rail - Every class in rail order.
 * @param regions - The regions, in their packing order.
 * @returns The phone view.
 */
export default function layOutPhoneView(
  model: ClassGraphModel,
  nodes: ReadonlyMap<string, LaidOutNode>,
  rail: readonly string[],
  regions: readonly {
    readonly prefix: string;
    readonly ids: readonly string[];
  }[],
): PhoneLayout {
  const rows = new Map<string, PhoneRow>();
  const headers: { prefix: string; y: number; count: number }[] = [];
  let y = 0;
  for (const region of regions) {
    headers.push({ prefix: region.prefix, y, count: region.ids.length });
    y += PHONE.header;
    for (const id of rail.filter(
      (candidate) => requireEntry(nodes, candidate).region === region.prefix,
    )) {
      const x = PHONE.indent * requireEntry(nodes, id).depth;
      rows.set(id, { id, x, y, w: PHONE.spine - x, h: BOX_HEIGHT });
      y += PHONE.pitch;
    }
  }
  const rowOf = (id: string): PhoneRow => requireEntry(rows, id);
  const portOf = (bundleHeads: ReadonlySet<string>, id: string): number =>
    rowOf(id).y + (bundleHeads.has(id) ? PHONE.inPort : PHONE.outPort);
  const collisionOf = (row: PhoneRow): Rect => ({
    x: row.x - COLLISION_MARGIN,
    y: row.y - COLLISION_MARGIN,
    w:
      row.w +
      2 * COLLISION_MARGIN +
      (requireEntry(nodes, row.id).loop ? PHONE.loop : 0),
    h: row.h + 2 * COLLISION_MARGIN,
  });
  // Each row's collision box, drawn in from its margin, measured once.
  const obstacles = [...rows.values()].map((row) => ({
    id: row.id,
    rect: insetRect(collisionOf(row), 2),
  }));
  const edges: LaidOutEdge[] = [];
  const arcs = model.bundles
    .filter((bundle) => !bundle.self)
    .map((bundle) => {
      const a = portOf(bundle.heads, bundle.a);
      const b = portOf(bundle.heads, bundle.b);
      return { bundle, a, b, low: Math.min(a, b), high: Math.max(a, b) };
    })
    .sort((x, z) =>
      orderBy(
        x.high - x.low - (z.high - z.low),
        compareText(x.bundle.id, z.bundle.id),
      ),
    );
  const done: { low: number; high: number; level: number }[] = [];
  for (const arc of arcs) {
    let level = 0;
    while (
      done.some(
        (other) =>
          other.level === level && other.low < arc.high && arc.low < other.high,
      )
    ) {
      level += 1;
    }
    done.push({ low: arc.low, high: arc.high, level });
    const spine = PHONE.spine;
    const heads: PathCommand[][] = [];
    if (arc.bundle.heads.has(arc.bundle.a))
      heads.push(buildArrowhead(spine, arc.a, false));
    if (arc.bundle.heads.has(arc.bundle.b))
      heads.push(buildArrowhead(spine, arc.b, false));
    const route = (bulge: number): PathCommand[] => {
      const sign = Math.sign(arc.b - arc.a);
      const radius = Math.min(bulge, Math.abs(arc.b - arc.a) / 2);
      return [
        ["M", spine, arc.a],
        [
          "C",
          spine + bulge,
          arc.a,
          spine + bulge,
          arc.a,
          spine + bulge,
          arc.a + sign * radius,
        ],
        ["V", arc.b - sign * radius],
        ["C", spine + bulge, arc.b, spine + bulge, arc.b, spine, arc.b],
      ];
    };
    // An arc never leaves its span, so only the rows across it can block
    // it; top first, so a sample finds the rows at its height by halving.
    const across = obstacles
      .filter(
        ({ id, rect }) =>
          id !== arc.bundle.a &&
          id !== arc.bundle.b &&
          rect.y <= arc.high &&
          arc.low <= rect.y + rect.h,
      )
      .map(({ rect }) => rect)
      .sort((p, q) => p.y - q.y);
    const tallest = Math.max(0, ...across.map((rect) => rect.h));
    const isBlocked = (sample: Point): boolean => {
      let low = 0;
      let high = across.length;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (requireAt(across, middle).y < sample[1]) low = middle + 1;
        else high = middle;
      }
      for (let at = low - 1; at >= 0; at -= 1) {
        const rect = requireAt(across, at);
        if (rect.y + tallest <= sample[1]) return false;
        if (containsPoint(sample, rect)) return true;
      }
      return false;
    };
    const base = Math.min(ARC_BASE + ARC_NEST * level, PHONE.arcCap);
    let chosen: PathCommand[] = route(base);
    for (let bulge = base; bulge <= PHONE.arcCap; bulge += ROUTE_STEP) {
      const commands = route(bulge);
      const samples = samplePath(formatPathData(commands), ROUTE_STEP);
      const blocked = samples.some(isBlocked);
      if (!blocked) {
        chosen = commands;
        break;
      }
    }
    edges.push({
      id: `rel:${arc.bundle.id}`,
      kind: "relation",
      bundle: arc.bundle,
      from: arc.bundle.a,
      to: [arc.bundle.b],
      d: formatPathData(chosen),
      heads: heads.map((head) => formatPathData(head)),
      region: requireEntry(nodes, arc.bundle.a).region,
      arc: true,
    });
  }
  for (const bundle of model.bundles.filter((candidate) => candidate.self)) {
    const row = rowOf(bundle.a);
    const spine = PHONE.spine;
    const out = row.y + PHONE.outPort;
    const back = row.y + PHONE.inPort;
    const middle = row.y + BOX_HEIGHT / 2;
    const reach = PHONE.loop;
    edges.push({
      id: `rel:${bundle.id}`,
      kind: "relation",
      bundle,
      from: bundle.a,
      to: [bundle.b],
      d: formatPathData([
        ["M", spine, out],
        ["H", spine + reach / 2],
        [
          "C",
          spine + (3 * reach) / 4,
          out,
          spine + reach,
          out - reach / 4,
          spine + reach,
          middle,
        ],
        [
          "C",
          spine + reach,
          back + reach / 4,
          spine + (3 * reach) / 4,
          back,
          spine + reach / 2,
          back,
        ],
        ["H", spine],
      ]),
      heads: [formatPathData(buildArrowhead(spine, back, false))],
      region: requireEntry(nodes, bundle.a).region,
      self: true,
    });
  }
  const guides = [...model.children].map(([parent, children]) => {
    const row = rowOf(parent);
    const lowest = Math.max(
      ...children.map((child) => rowOf(child).y + BOX_HEIGHT / 2),
    );
    const x = row.x + PHONE.indent / 2;
    return {
      from: parent,
      d: formatPathData([
        ["M", x, row.y + row.h],
        ["V", lowest],
      ]),
    };
  });
  edges.sort((a, b) => compareText(a.id, b.id));
  return { width: PHONE.width, height: y, headers, rows, edges, guides };
}
