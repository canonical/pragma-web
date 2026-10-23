import allocatePorts, { type FixedPort } from "./allocatePorts.js";
import {
  ARC_BASE,
  ARC_NEST,
  BUS_CLEARANCE,
  BUS_OFFSET,
  LATTICE,
  LOOP_INSET,
  PORT_LEVELS,
  ROW_GAP,
  WAYPOINT_SLOT,
} from "./constants.js";
import {
  averageOf,
  buildArrowhead,
  compareText,
  formatPathData,
  measurePathBounds,
  orderBy,
  roundTo,
  uniteRects,
} from "./geometry.js";
import { requireAt, requireEntry } from "./require.js";
import type {
  Bundle,
  ClassGraphModel,
  PathCommand,
  Point,
  Rect,
} from "./types.js";

/** A box placed in its region's own coordinates. */
export interface RegionNode {
  readonly id: string;
  readonly col: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** Its place in its column, top first. */
  readonly order: number;
}

/** An edge routed in its region's own coordinates. */
export interface RegionEdge {
  readonly id: string;
  readonly kind: "subclass" | "relation";
  readonly from: string;
  readonly to: readonly string[];
  readonly commands: readonly PathCommand[];
  readonly heads: readonly (readonly PathCommand[])[];
  readonly bundle?: Bundle;
  readonly busX?: number;
  readonly self?: boolean;
  readonly arc?: boolean;
  readonly apex?: Point;
}

/** One region laid out in its own coordinates, its top-left at the origin. */
export interface RegionLayout {
  readonly nodes: ReadonlyMap<string, RegionNode>;
  readonly edges: readonly RegionEdge[];
  /** Each column's items, top first: class IRIs and waypoint ids. */
  readonly columns: readonly (readonly string[])[];
  readonly columnX: readonly number[];
  readonly columnWidth: readonly number[];
  /** Each relation port's height, by `<bundle> <class>`. */
  readonly ports: ReadonlyMap<string, number>;
  /** The box that holds every node, loop and edge. */
  readonly content: Rect;
  /** Every rule the region could not keep, in words. */
  readonly findings: readonly string[];
  /** A class's column. */
  readonly columnOf: (id: string) => number;
  /** A class's superclass hops to its root. */
  readonly depthOf: (id: string) => number;
  /** A relation-placed class's predecessors, back edges removed. */
  readonly predecessorsOf: (id: string) => readonly string[];
}

/** An item of a column's stack: a class's box or a waypoint's slot. */
interface StackItem {
  readonly kind: "node" | "waypoint";
  readonly id: string;
  /** The height it takes in the stack: a loop's extent rides above its box. */
  readonly h: number;
  /** How far below the item's top its box starts. */
  readonly top: number;
  /** Its sibling group: its parent's IRI, or "" for none. */
  readonly group: string;
  readonly label: string;
}

/**
 * Lay out one namespace region as layered columns, root at the left, in the
 * region's own integer coordinates, so a change in another region leaves
 * this one untouched.
 *
 * Columns: a class whose superclass is drawn here sits one column right of
 * it; a class outside the subclass trees sits one right of its relation
 * predecessors, back edges found by a depth-first walk in IRI order
 * removed. Order: the subclass forest's pre-order, siblings by label, then
 * barycentre sweeps over every drawn edge that reorder only within a
 * sibling group (its own parent left out) and keep same-column partners
 * adjacent. Rows: 16px between boxes, a waypoint's 16px slot in place of
 * the gap it sits in, each column centred on its groups' parents and
 * snapped to the lattice. Columns are as wide as their widest box and its
 * loop, 48px apart (the channel), boxes flush left.
 *
 * Edges: one orthogonal bus per superclass, 16px into the channel, with
 * one hollow arrowhead at the superclass; relations between columns as
 * S-curves through their waypoints, same-column relations as arcs into the
 * channel nested by span, self-relations as one loop at the top-right
 * corner. Each route steps outward until no sample falls inside another
 * box's collision box.
 *
 * @param model - The class graph's model.
 * @param ids - The region's classes, by IRI.
 * @param channel - The gap between columns, in px.
 * @param sweeps - How many barycentre sweeps run.
 * @returns The region's layout.
 */
export default function layOutRegion(
  model: ClassGraphModel,
  ids: readonly string[],
  channel: number,
  sweeps: number,
): RegionLayout {
  const { byId } = model;
  const findings: string[] = [];
  const inRegion = new Set(ids);
  const classOf = (id: string) => requireEntry(byId, id);
  const parentOf = (id: string): string | undefined => model.parent.get(id);
  const childrenOf = (id: string): readonly string[] =>
    model.children.get(id) ?? [];
  const labelOf = (id: string): string => classOf(id).label;
  const byLabel = (a: string, b: string): number =>
    orderBy(compareText(labelOf(a), labelOf(b)), compareText(a, b));

  // (a) Columns.
  const depthOf = (id: string): number => {
    const parent = parentOf(id);
    return parent === undefined ? 0 : depthOf(parent) + 1;
  };
  const inTree = (id: string): boolean =>
    parentOf(id) !== undefined ||
    childrenOf(id).length > 0 ||
    model.crossParent.has(id);
  const relations = model.drawnRelations.filter(
    (relation) =>
      relation.domain !== relation.range &&
      inRegion.has(relation.domain) &&
      inRegion.has(relation.range),
  );
  const successors = new Map(
    ids.map((id) => [
      id,
      [
        ...new Set(
          relations
            .filter((relation) => relation.domain === id)
            .map((relation) => relation.range),
        ),
      ].sort(compareText),
    ]),
  );
  const visited = new Map<string, "open" | "done">();
  const backEdges = new Set<string>();
  const walk = (id: string): void => {
    visited.set(id, "open");
    for (const next of requireEntry(successors, id)) {
      if (visited.get(next) === "open") backEdges.add(`${id} ${next}`);
      else if (!visited.has(next)) walk(next);
    }
    visited.set(id, "done");
  };
  for (const id of ids) if (!visited.has(id)) walk(id);
  const predecessorsOf = (id: string): string[] => [
    ...new Set(
      relations
        .filter(
          (relation) =>
            relation.range === id && !backEdges.has(`${relation.domain} ${id}`),
        )
        .map((relation) => relation.domain),
    ),
  ];
  const columnMemo = new Map<string, number>();
  const columnOf = (id: string): number => {
    const known = columnMemo.get(id);
    if (known !== undefined) return known;
    const predecessors = predecessorsOf(id);
    const column = inTree(id)
      ? depthOf(id)
      : predecessors.length > 0
        ? 1 + Math.max(...predecessors.map(columnOf))
        : 0;
    columnMemo.set(id, column);
    return column;
  };
  const lastColumn = Math.max(...ids.map(columnOf));
  const columnRange = Array.from({ length: lastColumn + 1 }, (_, c) => c);

  // (b) Order: the forest's pre-order, siblings by label.
  const preorder: string[] = [];
  const visit = (id: string): void => {
    preorder.push(id);
    for (const child of [...childrenOf(id)].sort(byLabel)) visit(child);
  };
  for (const root of ids
    .filter((id) => parentOf(id) === undefined)
    .sort(byLabel)) {
    visit(root);
  }
  const columns: StackItem[][] = columnRange.map(() => []);
  const items = new Map<string, StackItem>();
  for (const id of preorder) {
    const klass = classOf(id);
    const item: StackItem = {
      kind: "node",
      id,
      h: klass.h + klass.loopExtent,
      top: klass.loopExtent,
      group: parentOf(id) ?? "",
      label: klass.label,
    };
    items.set(id, item);
    requireAt(columns, columnOf(id)).push(item);
  }
  const regionBundles = model.bundles.filter(
    (bundle) => inRegion.has(bundle.a) && inRegion.has(bundle.b),
  );
  // A relation that spans two or more columns gets one waypoint slot per
  // column it crosses.
  const chains = new Map<string, string[]>();
  for (const bundle of regionBundles) {
    if (bundle.self) continue;
    const [low, high] =
      columnOf(bundle.a) <= columnOf(bundle.b)
        ? [bundle.a, bundle.b]
        : [bundle.b, bundle.a];
    const chain = [low];
    for (let c = columnOf(low) + 1; c < columnOf(high); c += 1) {
      const waypoint: StackItem = {
        kind: "waypoint",
        id: `${bundle.id}@${c}`,
        h: WAYPOINT_SLOT,
        top: 0,
        group: "",
        label: "",
      };
      items.set(waypoint.id, waypoint);
      requireAt(columns, c).push(waypoint);
      chain.push(waypoint.id);
    }
    chain.push(high);
    chains.set(bundle.id, chain);
  }
  const columnOfItem = (id: string): number =>
    requireEntry(items, id).kind === "node"
      ? columnOf(id)
      : Number(id.split("@").at(-1));
  const neighbours = new Map<string, string[]>(
    [...items.keys()].map((id) => [id, []]),
  );
  const link = (a: string, b: string): void => {
    requireEntry(neighbours, a).push(b);
    requireEntry(neighbours, b).push(a);
  };
  for (const id of ids) {
    const parent = parentOf(id);
    if (parent !== undefined) link(id, parent);
  }
  for (const chain of chains.values()) {
    for (let index = 1; index < chain.length; index += 1) {
      link(requireAt(chain, index - 1), requireAt(chain, index));
    }
  }
  const partners = regionBundles
    .filter(
      (bundle) => !bundle.self && columnOf(bundle.a) === columnOf(bundle.b),
    )
    .map((bundle): readonly [string, string] => [bundle.a, bundle.b]);

  // Order a sibling group's members by key, keeping same-column partners
  // adjacent: a path in chain order, any other component breadth first.
  const orderCluster = (
    members: readonly StackItem[],
    key: ReadonlyMap<string, number>,
  ): StackItem[] => {
    const memberIds = new Set(members.map((member) => member.id));
    const adjacent = new Map(
      members.map((member) => [member.id, [] as string[]]),
    );
    for (const [a, b] of partners) {
      if (
        memberIds.has(a) &&
        memberIds.has(b) &&
        !requireEntry(adjacent, a).includes(b)
      ) {
        requireEntry(adjacent, a).push(b);
        requireEntry(adjacent, b).push(a);
      }
    }
    const order = (x: StackItem, y: StackItem): number =>
      orderBy(
        requireEntry(key, x.id) - requireEntry(key, y.id),
        compareText(x.label, y.label),
        compareText(x.id, y.id),
      );
    const byMember = new Map(members.map((member) => [member.id, member]));
    const seen = new Set<string>();
    const components: { ids: string[]; key: number; first: StackItem }[] = [];
    for (const member of [...members].sort(order)) {
      if (seen.has(member.id)) continue;
      const component: string[] = [];
      const queue = [member.id];
      seen.add(member.id);
      while (queue.length > 0) {
        const id = requireAt(queue, 0);
        queue.shift();
        component.push(id);
        for (const next of requireEntry(adjacent, id)) {
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        }
      }
      const edges =
        component.reduce(
          (sum, id) => sum + requireEntry(adjacent, id).length,
          0,
        ) / 2;
      const isPath =
        component.every((id) => requireEntry(adjacent, id).length <= 2) &&
        edges === component.length - 1;
      const candidates = (
        isPath
          ? component.filter((id) => requireEntry(adjacent, id).length <= 1)
          : component
      )
        .map((id) => requireEntry(byMember, id))
        .sort(order);
      const start = requireAt(candidates, 0).id;
      const ordered: string[] = [];
      const pending = [start];
      const placed = new Set([start]);
      while (pending.length > 0) {
        const id = requireAt(pending, 0);
        pending.shift();
        ordered.push(id);
        const nextIds = requireEntry(adjacent, id)
          .map((next) => requireEntry(byMember, next))
          .sort(order);
        for (const next of nextIds) {
          if (!placed.has(next.id)) {
            placed.add(next.id);
            pending.push(next.id);
          }
        }
      }
      components.push({
        ids: ordered,
        key: averageOf(ordered.map((id) => requireEntry(key, id))),
        first: requireEntry(byMember, requireAt(ordered, 0)),
      });
    }
    components.sort((x, y) =>
      orderBy(
        x.key - y.key,
        compareText(x.first.label, y.first.label),
        compareText(x.first.id, y.first.id),
      ),
    );
    return components.flatMap((component) =>
      component.ids.map((id) => requireEntry(byMember, id)),
    );
  };

  // An item's relative position in its column, so columns of different
  // lengths compare.
  const positionIn = (column: number, id: string): number => {
    const stack = requireAt(columns, column);
    return (stack.findIndex((item) => item.id === id) + 0.5) / stack.length;
  };
  const reorderColumn = (column: number, fixed: number | null): void => {
    const stack = requireAt(columns, column);
    const key = new Map<string, number>();
    for (const item of stack) {
      const near =
        fixed === null
          ? []
          : requireEntry(neighbours, item.id).filter(
              (id) => columnOfItem(id) === fixed && id !== item.group,
            );
      key.set(
        item.id,
        near.length > 0 && fixed !== null
          ? averageOf(near.map((id) => positionIn(fixed, id)))
          : positionIn(column, item.id),
      );
    }
    const groups = new Map<string, number[]>();
    stack.forEach((item, index) => {
      groups.set(item.group, [...(groups.get(item.group) ?? []), index]);
    });
    const next = [...stack];
    for (const slots of groups.values()) {
      const ordered = orderCluster(
        slots.map((slot) => requireAt(stack, slot)),
        key,
      );
      slots.forEach((slot, index) => {
        next[slot] = requireAt(ordered, index);
      });
    }
    columns[column] = next;
  };
  for (let sweep = 0; sweep < sweeps; sweep += 1) {
    const forward = sweep % 2 === 0;
    const range = forward
      ? columnRange.slice(1)
      : columnRange.slice(0, -1).reverse();
    for (const column of range) {
      reorderColumn(column, forward ? column - 1 : column + 1);
    }
  }
  if (sweeps === 0)
    for (const column of columnRange) reorderColumn(column, null);

  // (c) Rows: each column one contiguous stack, centred on its groups'
  // parents, snapped to the lattice.
  const tops = new Map<string, number>();
  const centreOf = (id: string): number => {
    const item = requireEntry(items, id);
    const top = requireEntry(tops, id) + item.top;
    return item.kind === "node"
      ? top + classOf(id).h / 2
      : top + WAYPOINT_SLOT / 2;
  };
  for (const column of columnRange) {
    const stack = requireAt(columns, column);
    const offsets: number[] = [];
    let offset = 0;
    stack.forEach((item, index) => {
      const previous = stack.at(index - 1);
      if (index > 0 && previous?.kind === "node" && item.kind === "node") {
        offset += ROW_GAP;
      }
      offsets.push(offset);
      offset += item.h;
    });
    const deltas: number[] = [];
    const groups = new Map<string, number[]>();
    stack.forEach((item, index) => {
      if (item.group !== "") {
        groups.set(item.group, [...(groups.get(item.group) ?? []), index]);
      }
    });
    for (const [group, members] of groups) {
      const first = requireAt(offsets, Math.min(...members));
      const lastIndex = Math.max(...members);
      const last =
        requireAt(offsets, lastIndex) + requireAt(stack, lastIndex).h;
      deltas.push(centreOf(group) - (first + last) / 2);
    }
    // A column with no sibling group holds only relation-placed classes and
    // waypoints, each linked to the column on its left: its predecessor's
    // chain arrives from there. It centres on those neighbours.
    if (deltas.length === 0 && column > 0) {
      stack.forEach((item, index) => {
        const near = requireEntry(neighbours, item.id).filter(
          (id) => columnOfItem(id) === column - 1,
        );
        const ownCentre =
          requireAt(offsets, index) +
          item.top +
          (item.kind === "node" ? classOf(item.id).h / 2 : WAYPOINT_SLOT / 2);
        deltas.push(averageOf(near.map(centreOf)) - ownCentre);
      });
    }
    const shift = deltas.length > 0 ? roundTo(averageOf(deltas), LATTICE) : 0;
    stack.forEach((item, index) => {
      tops.set(item.id, shift + requireAt(offsets, index));
    });
  }
  const highest = Math.min(...tops.values());
  for (const [id, top] of tops) tops.set(id, top - highest);

  // (d) Columns' x: as wide as the widest box and its loop.
  const columnWidth = columnRange.map((column) =>
    Math.max(
      ...requireAt(columns, column)
        .filter((item) => item.kind === "node")
        .map((item) => classOf(item.id).w + classOf(item.id).loopExtent),
    ),
  );
  const columnX: number[] = [0];
  for (const column of columnRange.slice(1)) {
    columnX.push(
      requireAt(columnX, column - 1) +
        requireAt(columnWidth, column - 1) +
        channel,
    );
  }
  const rightOf = (column: number): number =>
    requireAt(columnX, column) + requireAt(columnWidth, column);
  const nodes = new Map<string, RegionNode>(
    ids.map((id) => {
      const klass = classOf(id);
      const column = columnOf(id);
      return [
        id,
        {
          id,
          col: column,
          x: requireAt(columnX, column),
          y: requireEntry(tops, id) + klass.loopExtent,
          w: klass.w,
          h: klass.h,
          order: requireAt(columns, column).findIndex((item) => item.id === id),
        },
      ];
    }),
  );
  const nodeOf = (id: string): RegionNode => requireEntry(nodes, id);

  // Ports.
  const sides = new Map(
    ids.map((id) => [
      id,
      {
        left: { fixed: [] as FixedPort[], requests: [] as PortRequest[] },
        right: { fixed: [] as FixedPort[], requests: [] as PortRequest[] },
      },
    ]),
  );
  for (const id of ids) {
    const node = nodeOf(id);
    const side = requireEntry(sides, id);
    if (childrenOf(id).length > 0)
      side.right.fixed.push({ kind: "tick", y: node.h / 2 });
    if (parentOf(id) !== undefined || model.crossParent.has(id)) {
      side.left.fixed.push({ kind: "tick", y: node.h / 2 });
    }
    if (classOf(id).loop)
      side.right.fixed.push({ kind: "loop", y: LOOP_INSET });
  }
  for (const bundle of regionBundles) {
    if (bundle.self) continue;
    const chain = requireEntry(chains, bundle.id);
    const ends: [string, "left" | "right", string][] =
      columnOf(bundle.a) === columnOf(bundle.b)
        ? [
            [bundle.a, "right", bundle.b],
            [bundle.b, "right", bundle.a],
          ]
        : [
            [requireAt(chain, 0), "right", requireAt(chain, 1)],
            [requireAt(chain, -1), "left", requireAt(chain, -2)],
          ];
    for (const [id, sideName, other] of ends) {
      requireEntry(sides, id)[sideName].requests.push({
        key: `${bundle.id} ${id}`,
        otherY: centreOf(other),
        otherLabel: requireEntry(items, other).label,
        bundle: bundle.id,
        ideal: centreOf(other) - nodeOf(id).y,
      });
    }
  }
  for (const bundle of model.bundles.filter((candidate) => candidate.cross)) {
    for (const id of [bundle.a, bundle.b]) {
      if (!inRegion.has(id)) continue;
      requireEntry(sides, id)[id === bundle.a ? "right" : "left"].requests.push(
        {
          key: `${bundle.id} ${id}`,
          otherY: centreOf(id),
          otherLabel: "",
          bundle: bundle.id,
          ideal: nodeOf(id).h / 2,
        },
      );
    }
  }
  const ports = new Map<string, number>();
  for (const id of ids) {
    for (const sideName of ["left", "right"] as const) {
      const side = requireEntry(sides, id)[sideName];
      side.requests.sort((a, b) =>
        orderBy(
          a.otherY - b.otherY,
          compareText(a.otherLabel, b.otherLabel),
          compareText(a.bundle, b.bundle),
        ),
      );
      const hub = classOf(id).hub;
      const { ys, level } = allocatePorts(
        nodeOf(id).h,
        side.fixed,
        side.requests.map((request) => request.ideal),
        hub,
      );
      side.requests.forEach((request, index) => {
        ports.set(request.key, nodeOf(id).y + requireAt(ys, index));
      });
      findings.push(
        ...describePortRelaxation(
          labelOf(id),
          sideName,
          side.requests.length,
          level,
          hub,
        ),
      );
    }
  }

  // Subclass buses.
  const edges: RegionEdge[] = [];
  for (const id of ids) {
    const subclasses = childrenOf(id);
    if (subclasses.length === 0) continue;
    const parent = nodeOf(id);
    const portX = parent.x + parent.w;
    const portY = parent.y + parent.h / 2;
    const busX = rightOf(parent.col) + BUS_OFFSET;
    const middles = subclasses.map(
      (child) => nodeOf(child).y + nodeOf(child).h / 2,
    );
    const entry = requireAt(columnX, parent.col + 1);
    edges.push({
      id: `sub:${id}`,
      kind: "subclass",
      from: id,
      to: subclasses,
      commands: [
        ["M", portX, portY],
        ["H", busX],
        ["M", busX, Math.min(portY, ...middles)],
        ["V", Math.max(portY, ...middles)],
        ...middles.flatMap((middle): PathCommand[] => [
          ["M", busX, middle],
          ["H", entry],
        ]),
      ],
      heads: [buildArrowhead(portX, portY, false)],
      busX,
    });
  }

  // Relations: loops, S-curves between columns, arcs within one.
  const arcs: Bundle[] = [];
  for (const bundle of regionBundles) {
    if (bundle.self) {
      const node = nodeOf(bundle.a);
      const extent = classOf(bundle.a).loopExtent;
      const right = node.x + node.w;
      const top = node.y;
      const commands: PathCommand[] = [
        ["M", right - LOOP_INSET, top],
        [
          "C",
          right - LOOP_INSET,
          top - 2 * extent,
          right + 2 * extent,
          top + LOOP_INSET,
          right,
          top + LOOP_INSET,
        ],
      ];
      const bounds = measurePathBounds(formatPathData(commands));
      edges.push({
        id: `rel:${bundle.id}`,
        kind: "relation",
        bundle,
        from: bundle.a,
        to: [bundle.b],
        commands,
        heads: [buildArrowhead(right, top + LOOP_INSET, false)],
        self: true,
        apex: [Math.round(bounds.x + bounds.w), Math.round(bounds.y)],
      });
      continue;
    }
    if (columnOf(bundle.a) === columnOf(bundle.b)) {
      arcs.push(bundle);
      continue;
    }
    const chain = requireEntry(chains, bundle.id);
    const low = nodeOf(requireAt(chain, 0));
    const high = nodeOf(requireAt(chain, -1));
    const lowPort = requireEntry(ports, `${bundle.id} ${low.id}`);
    const highPort = requireEntry(ports, `${bundle.id} ${high.id}`);
    const heads: PathCommand[][] = [];
    if (bundle.heads.has(low.id))
      heads.push(buildArrowhead(low.x + low.w, lowPort, false));
    if (bundle.heads.has(high.id))
      heads.push(buildArrowhead(high.x, highPort, true));
    // The channel between columns holds no box and each waypoint has its
    // own slot, so the S-curve from facing side to facing side keeps out of
    // every other box as it is.
    const commands: PathCommand[] = [["M", low.x + low.w, lowPort]];
    let x = rightOf(low.col);
    let y = lowPort;
    if (low.x + low.w < x) commands.push(["H", x]);
    const curveTo = (toX: number, toY: number): void => {
      const half = (toX - x) / 2;
      commands.push(["C", x + half, y, toX - half, toY, toX, toY]);
      x = toX;
      y = toY;
    };
    for (const waypoint of chain.slice(1, -1)) {
      const column = columnOfItem(waypoint);
      curveTo(
        requireAt(columnX, column),
        requireEntry(tops, waypoint) + WAYPOINT_SLOT / 2,
      );
      commands.push(["H", rightOf(column)]);
      x = rightOf(column);
    }
    curveTo(requireAt(columnX, high.col), highPort);
    edges.push({
      id: `rel:${bundle.id}`,
      kind: "relation",
      bundle,
      from: bundle.a,
      to: [bundle.b],
      commands,
      heads,
    });
  }
  // Same-column arcs nest by span, shortest first; an arc beside a subclass
  // bus in its channel starts 12px past the bus, clearing it.
  const busSpans = edges
    .filter((edge) => edge.kind === "subclass")
    .map((edge) => {
      const parent = nodeOf(edge.from);
      const ys = [
        parent.y + parent.h / 2,
        ...edge.to.map((child) => nodeOf(child).y + nodeOf(child).h / 2),
      ];
      return { col: parent.col, low: Math.min(...ys), high: Math.max(...ys) };
    });
  const isBesideBus = (column: number, a: number, b: number): boolean =>
    busSpans.some(
      (span) =>
        span.col === column &&
        span.low < Math.max(a, b) &&
        Math.min(a, b) < span.high,
    );
  const levels = new Map<string, number>();
  for (const column of columnRange) {
    const here = arcs
      .filter((bundle) => columnOf(bundle.a) === column)
      .map((bundle) => {
        const a = requireEntry(ports, `${bundle.id} ${bundle.a}`);
        const b = requireEntry(ports, `${bundle.id} ${bundle.b}`);
        return { bundle, low: Math.min(a, b), high: Math.max(a, b) };
      })
      .sort((x, y) =>
        orderBy(
          x.high - x.low - (y.high - y.low),
          compareText(x.bundle.id, y.bundle.id),
        ),
      );
    const done: { low: number; high: number; level: number }[] = [];
    for (const arc of here) {
      let level = 0;
      while (
        done.some(
          (other) =>
            other.level === level &&
            other.low < arc.high &&
            arc.low < other.high,
        )
      ) {
        level += 1;
      }
      done.push({ low: arc.low, high: arc.high, level });
      levels.set(arc.bundle.id, level);
    }
  }
  for (const bundle of arcs) {
    const a = nodeOf(bundle.a);
    const b = nodeOf(bundle.b);
    const portA = requireEntry(ports, `${bundle.id} ${bundle.a}`);
    const portB = requireEntry(ports, `${bundle.id} ${bundle.b}`);
    const edgeX = rightOf(a.col);
    const heads: PathCommand[][] = [];
    if (bundle.heads.has(bundle.a))
      heads.push(buildArrowhead(a.x + a.w, portA, false));
    if (bundle.heads.has(bundle.b))
      heads.push(buildArrowhead(b.x + b.w, portB, false));
    const level = requireEntry(levels, bundle.id);
    // An arc bulges into its own channel, which holds no box, so it keeps
    // out of every other box at the bulge its nesting gives it.
    const bulge = isBesideBus(a.col, portA, portB)
      ? BUS_OFFSET + BUS_CLEARANCE + ARC_NEST * level
      : ARC_BASE + ARC_NEST * level;
    const sign = Math.sign(portB - portA);
    const radius = Math.min(bulge, Math.abs(portB - portA) / 2);
    const commands: PathCommand[] = [["M", a.x + a.w, portA]];
    if (a.x + a.w < edgeX) commands.push(["H", edgeX]);
    commands.push(
      [
        "C",
        edgeX + bulge,
        portA,
        edgeX + bulge,
        portA,
        edgeX + bulge,
        portA + sign * radius,
      ],
      ["V", portB - sign * radius],
      ["C", edgeX + bulge, portB, edgeX + bulge, portB, edgeX, portB],
    );
    if (b.x + b.w < edgeX) commands.push(["H", b.x + b.w]);
    findings.push(
      ...describeArcNesting(bundle.id, bulge, channel, a.col < lastColumn),
    );
    edges.push({
      id: `rel:${bundle.id}`,
      kind: "relation",
      bundle,
      from: bundle.a,
      to: [bundle.b],
      commands,
      heads,
      arc: true,
      apex: [edgeX + bulge, Math.round((portA + portB) / 2)],
    });
  }

  const content = uniteRects([
    ...[...nodes.values()].map((node) => {
      const extent = classOf(node.id).loopExtent;
      return {
        x: node.x,
        y: node.y - extent,
        w: node.w + extent,
        h: node.h + extent,
      };
    }),
    ...edges.flatMap((edge) => [
      measurePathBounds(formatPathData(edge.commands)),
      ...edge.heads.map((head) => measurePathBounds(formatPathData(head))),
    ]),
  ]);
  return {
    nodes,
    edges,
    columns: columns.map((stack) => stack.map((item) => item.id)),
    columnX,
    columnWidth,
    ports,
    content,
    findings,
    columnOf,
    depthOf,
    predecessorsOf,
  };
}

/**
 * Describe a box side whose ports needed a looser spacing than its level:
 * one finding, or none when the side kept its spacing.
 */
export function describePortRelaxation(
  label: string,
  side: string,
  ports: number,
  level: number,
  hub: boolean,
): string[] {
  if (level <= (hub ? 1 : 0)) return [];
  return [
    `G6: ${label}'s ${side} side needs ${ports} relation ports; relaxed to "${requireAt(PORT_LEVELS, level).name}"`,
  ];
}

/**
 * Describe a same-column arc nested past its channel, where it would run
 * into the next column: one finding, or none.
 */
export function describeArcNesting(
  id: string,
  bulge: number,
  channel: number,
  hasNextColumn: boolean,
): string[] {
  if (!hasNextColumn || bulge <= channel - 8) return [];
  return [
    `G18: arc ${id} nests to ${bulge}px, beyond the ${channel}px channel`,
  ];
}

/** A relation's request for a port on one side of a box. */
interface PortRequest {
  readonly key: string;
  readonly otherY: number;
  readonly otherLabel: string;
  readonly bundle: string;
  readonly ideal: number;
}
