import { createTranslator } from "@canonical/i18n-core";
import {
  BUS_OFFSET,
  buildArrowhead,
  ceilTo,
  compareText,
  formatPathData,
  type GraphLayoutResult,
  LATTICE,
  layoutLayered,
  measurePathBounds,
  measureRegionLabelWidth,
  orderBy,
  type PathCommand,
  REGION_LABEL_ROW,
  type Rect,
  requireAt,
  requireDefined,
  requireEntry,
  roundTo,
  uniteRects,
} from "@canonical/prism-core";
import { MESSAGES } from "../i18n/constants.js";
import buildClassGraphModel from "./buildClassGraphModel.js";
import chooseDrawnScope from "./chooseDrawnScope.js";
import {
  ALIGNMENT_SEARCH_LIMIT,
  BRIDGE_CHANNEL_ROOM,
  BRIDGE_GAP_ROOM,
  BRIDGE_LABEL_BAND,
  CHANNEL,
  CROSS_CHANNEL_OFFSET,
  DESIGN_CANVAS,
  FALLBACK_CHANNEL,
  MEASURED_LOCALE,
  MIN_FIT,
  REGION_ALIGNMENTS,
  SHELF_ALIGNMENTS,
  SHELF_GAP,
  SWEEPS,
  VIEW_MARGIN,
} from "./constants.js";
import frameOpeningWindow from "./frameOpeningWindow.js";
import gatherDrawnInput from "./gatherDrawnInput.js";
import layOutPhoneView from "./layOutPhoneView.js";
import listRegionBridges from "./listRegionBridges.js";
import offsetLane from "./offsetLane.js";
import opensWhole from "./opensWhole.js";
import orderBoxedClasses from "./orderBoxedClasses.js";
import orderRail from "./orderRail.js";
import orderRegionsByBridges from "./orderRegionsByBridges.js";
import packShelves from "./packShelves.js";
import placeBridgeLabels from "./placeBridgeLabels.js";
import routeNeighbourBridges from "./routeNeighbourBridges.js";
import type {
  Bundle,
  ClassGraphInput,
  ClassGraphLayout,
  ClassGraphLayoutOptions,
  ClassGraphModel,
  CrossPort,
  DrawnScope,
  LaidOutEdge,
  LaidOutNode,
  LaidOutRegion,
  LayerSettings,
  NeighbourBridgeEnds,
  NodeNavigation,
  ShelfPacking,
  SpecimenGraphInput,
} from "./types.js";

/** A region laid out in its own coordinates, with its packed size. */
interface SizedRegion {
  readonly prefix: string;
  readonly ids: readonly string[];
  readonly layout: GraphLayoutResult<Bundle>;
  readonly w: number;
  readonly h: number;
}

/** Size a laid-out region: its content and label row, on the lattice. */
function sizeRegion(
  prefix: string,
  ids: readonly string[],
  layout: GraphLayoutResult<Bundle>,
): SizedRegion {
  return {
    prefix,
    ids,
    layout,
    w: ceilTo(
      Math.max(
        layout.content.x + layout.content.w,
        measureRegionLabelWidth(prefix, ids.length),
      ),
      LATTICE,
    ),
    h: ceilTo(REGION_LABEL_ROW + layout.content.y + layout.content.h, LATTICE),
  };
}

/**
 * Lay one region out with the layered engine at a channel, its relations
 * to other regions meeting their boxes at the ports given, with the
 * engine's sweeps and the most classes one column holds.
 */
function layOutLayers(
  model: ClassGraphModel,
  ids: readonly string[],
  channel: number,
  engine: LayerSettings,
  crossPorts?: ReadonlyMap<string, CrossPort>,
): GraphLayoutResult<Bundle> {
  return layoutLayered(model, model, {
    ids,
    channel,
    ...engine,
    ...(crossPorts === undefined ? {} : { crossPorts }),
  });
}

/**
 * Lay every region out at a channel, in the order given, and pack them
 * into shelves, saying whether any arc nests past the channel.
 */
function packRegions(
  model: ClassGraphModel,
  order: readonly {
    readonly prefix: string;
    readonly ids: readonly string[];
  }[],
  channel: number,
  engine: LayerSettings,
): {
  readonly regions: readonly SizedRegion[];
  readonly packing: ShelfPacking;
  readonly crowded: boolean;
} {
  const regions = order.map(({ prefix, ids }) =>
    sizeRegion(prefix, ids, layOutLayers(model, ids, channel, engine)),
  );
  return {
    regions,
    packing: packShelves(regions),
    crowded: regions.some((region) => region.layout.crowdedArcs > 0),
  };
}

/** Where a region sits: its top-left corner and its shelf's top. */
interface RegionPlace {
  readonly x: number;
  readonly y: number;
  readonly shelfY: number;
}

/**
 * Choose where each end of a relation between two regions meets its box,
 * from where the regions are placed: the side that faces the other end
 * (the domain's left and the range's right when the range lies to the
 * left, the right of both when the two boxes overlap across), with the
 * port's ideal offset towards the other end's middle.
 */
function chooseCrossPorts(
  model: ClassGraphModel,
  sized: readonly SizedRegion[],
  places: ReadonlyMap<string, RegionPlace>,
): Map<string, CrossPort> {
  const boxOf = (id: string) => {
    const region = requireDefined(
      sized.find((candidate) => candidate.layout.nodes.has(id)),
      `the region of ${id}`,
    );
    const node = requireEntry(region.layout.nodes, id);
    const place = requireEntry(places, region.prefix);
    return {
      x: node.x + place.x,
      y: node.y + place.y + REGION_LABEL_ROW,
      w: node.w,
      h: node.h,
    };
  };
  const ports = new Map<string, CrossPort>();
  for (const bundle of model.bundles.filter((candidate) => candidate.cross)) {
    const a = boxOf(bundle.a);
    const b = boxOf(bundle.b);
    const [sideA, sideB]: readonly ["left" | "right", "left" | "right"] =
      b.x >= a.x + a.w
        ? ["right", "left"]
        : b.x + b.w <= a.x
          ? ["left", "right"]
          : ["right", "right"];
    ports.set(`${bundle.id} ${bundle.a}`, {
      side: sideA,
      ideal: b.y + b.h / 2 - a.y,
    });
    ports.set(`${bundle.id} ${bundle.b}`, {
      side: sideB,
      ideal: a.y + a.h / 2 - b.y,
    });
  }
  return ports;
}

/**
 * Count the cells of a 4 by 4 grid over the design canvas that hold no part
 * of a box, with the regions placed as given and fitted to the canvas.
 */
function countEmptyCells(
  sized: readonly SizedRegion[],
  places: ReadonlyMap<string, RegionPlace>,
  packing: ShelfPacking,
): number {
  const zoom = packing.fit;
  const boxes = sized.flatMap((region) => {
    const place = requireEntry(places, region.prefix);
    return [...region.layout.nodes.values()].map((node) => ({
      x: (node.x + place.x + VIEW_MARGIN) * zoom,
      y: (node.y + place.y + REGION_LABEL_ROW + VIEW_MARGIN) * zoom,
      w: node.w * zoom,
      h: node.h * zoom,
    }));
  });
  let empty = 0;
  for (let cell = 0; cell < 16; cell += 1) {
    const x = ((cell % 4) * DESIGN_CANVAS.w) / 4;
    const y = (Math.floor(cell / 4) * DESIGN_CANVAS.h) / 4;
    const w = DESIGN_CANVAS.w / 4;
    const h = DESIGN_CANVAS.h / 4;
    const covered = boxes.some(
      (box) =>
        box.x < x + w &&
        x < box.x + box.w &&
        box.y < y + h &&
        y < box.y + box.h,
    );
    if (!covered) empty += 1;
  }
  return empty;
}

/**
 * Place packed regions on their shelves, 48px apart in both directions, on
 * the lattice. A shelf narrower than the packing may sit flush left, in
 * the middle or flush right, and a region shorter than its shelf at the
 * shelf's middle, top or bottom: every combination of the first
 * `ALIGNMENT_SEARCH_LIMIT` choices (the shelves', then the regions') is
 * tried, in those orders, the rest keeping their first share, and the
 * first that leaves the fewest empty cells on the canvas is kept.
 */
function alignShelves(
  sized: readonly SizedRegion[],
  packing: ShelfPacking,
): Map<string, RegionPlace> {
  const entries: {
    readonly index: number;
    readonly shelf: number;
    readonly x: number;
    readonly shelfY: number;
    readonly room: number;
  }[] = [];
  const slack: number[] = [];
  let shelfY = 0;
  packing.shelves.forEach((shelf, shelfIndex) => {
    const height = Math.max(...shelf.map((index) => requireAt(sized, index).h));
    let x = 0;
    for (const index of shelf) {
      const region = requireAt(sized, index);
      entries.push({
        index,
        shelf: shelfIndex,
        x,
        shelfY,
        room: height - region.h,
      });
      x += region.w + SHELF_GAP;
    }
    slack.push(packing.w - (x - SHELF_GAP));
    shelfY += height + SHELF_GAP;
  });
  // Every open alignment is one choice of three shares; a pick numbers one
  // share per choice in base 3.
  const choices: (readonly number[])[] = [];
  const openChoice = (room: number, shares: readonly number[]): number => {
    if (room <= 0) return -1;
    choices.push(shares);
    return choices.length - 1;
  };
  const shelfChoice = slack.map((room) => openChoice(room, SHELF_ALIGNMENTS));
  const regionChoice = entries.map((entry) =>
    openChoice(entry.room, REGION_ALIGNMENTS),
  );
  const shareOf = (pick: number, choice: number): number =>
    choice === -1
      ? 0
      : requireAt(
          requireAt(choices, choice),
          Math.floor(pick / 3 ** choice) % 3,
        );
  // The first choices are searched together; any past the limit keep their
  // first share, as a pick below 3 to the limit reads 0 for them.
  const picks = 3 ** Math.min(choices.length, ALIGNMENT_SEARCH_LIMIT);
  let best: { places: Map<string, RegionPlace>; empty: number } | undefined;
  for (let pick = 0; pick < picks; pick += 1) {
    const places = new Map<string, RegionPlace>();
    entries.forEach((entry, at) => {
      const shift = roundTo(
        requireAt(slack, entry.shelf) *
          shareOf(pick, requireAt(shelfChoice, entry.shelf)),
        LATTICE,
      );
      const drop = roundTo(
        entry.room * shareOf(pick, requireAt(regionChoice, at)),
        LATTICE,
      );
      places.set(requireAt(sized, entry.index).prefix, {
        x: entry.x + shift,
        y: entry.shelfY + drop,
        shelfY: entry.shelfY,
      });
    });
    const empty = countEmptyCells(sized, places, packing);
    if (best === undefined || empty < best.empty) best = { places, empty };
  }
  return requireDefined(best, "region placement").places;
}

/**
 * Lay a model out: what `layOutClassGraph` does once it knows what is
 * drawn, the whole graph's model naming the classes a box stands for, and
 * an opened view's namespace packed first.
 */
function layOutModel(
  model: ClassGraphModel,
  whole: ClassGraphModel,
  engine: LayerSettings,
  lead?: string,
): ClassGraphLayout {
  // An ontology with no class is data a provider may serve: it lays out
  // as an empty floor the size of the design canvas.
  if (model.byId.size === 0) {
    return {
      model,
      nodes: new Map(),
      edges: [],
      regions: [],
      rail: [],
      viewBox: { x: 0, y: 0, w: DESIGN_CANVAS.w, h: DESIGN_CANVAS.h },
      view: { x: 0, y: 0, w: DESIGN_CANVAS.w, h: DESIGN_CANVAS.h },
      fitZoom: 1,
      channel: CHANNEL,
      findings: [],
      phone: layOutPhoneView(model, new Map(), [], []),
    };
  }
  const findings: string[] = [];
  const idsOf = new Map(
    model.regionOrder.map(({ prefix, ids }) => [prefix, ids]),
  );
  const order = orderRegionsByBridges(
    model.regionOrder.map(({ prefix, ids }) => {
      const first = requireEntry(model.byId, requireAt(ids, 0));
      return first.kind === "class"
        ? { prefix, size: ids.length }
        : { prefix, size: first.members, kind: first.kind };
    }),
    listRegionBridges(model),
    lead,
  ).map((prefix) => ({ prefix, ids: requireEntry(idsOf, prefix) }));
  let channel = CHANNEL;
  let packed = packRegions(model, order, channel, engine);
  if (packed.packing.fit < MIN_FIT) {
    const retry = packRegions(model, order, FALLBACK_CHANNEL, engine);
    findings.push(
      `G3: fit ${packed.packing.fit.toFixed(3)} at ${CHANNEL}px channels; ${retry.packing.fit.toFixed(3)} at ${FALLBACK_CHANNEL}px`,
    );
    // The narrower channels are taken whenever they lift the fit, unless an
    // arc that nests in them would then run into the next column.
    if (retry.packing.fit > packed.packing.fit && !retry.crowded) {
      packed = retry;
      channel = FALLBACK_CHANNEL;
    }
    if (packed.packing.fit < MIN_FIT)
      findings.push("G3: opens on a legible window, the rest a pan away");
  }
  const { regions: packedRegions } = packed;

  // Each end of a relation between regions meets its box on the side that
  // faces the other end where the regions first fall, so the regions such
  // relations touch are laid out again with those ports and the regions
  // packed and placed again at their sizes.
  const crossPorts = chooseCrossPorts(
    model,
    packedRegions,
    alignShelves(packedRegions, packed.packing),
  );
  const sized = packedRegions.map((region) =>
    [...crossPorts.keys()].some((key) => region.layout.ports.has(key))
      ? sizeRegion(
          region.prefix,
          region.ids,
          layOutLayers(model, region.ids, channel, engine, crossPorts),
        )
      : region,
  );
  const packing = packShelves(sized);

  // Place the regions: shelves 48px apart, each region shorter than its
  // shelf aligned to its top, middle or bottom, whichever leaves the
  // fewest empty cells on the canvas.
  const placed = alignShelves(sized, packing);
  const sizedByPrefix = new Map(sized.map((region) => [region.prefix, region]));
  const regionOf = (prefix: string): SizedRegion =>
    requireEntry(sizedByPrefix, prefix);
  const originOf = (prefix: string) => {
    const place = requireEntry(placed, prefix);
    return { ...place, ox: place.x, oy: place.y + REGION_LABEL_ROW };
  };

  const nodeList: Omit<LaidOutNode, "nav">[] = [];
  const edges: LaidOutEdge[] = [];
  const rail: string[] = [];
  // Each region's first column in the graph: the columns of the regions
  // packed before it.
  const firstColumns = new Map<string, number>();
  for (const region of sized) {
    firstColumns.set(
      region.prefix,
      [...firstColumns.keys()].reduce(
        (sum, prefix) => sum + regionOf(prefix).layout.columns.length,
        0,
      ),
    );
  }
  for (const region of sized) {
    const { ox, oy } = originOf(region.prefix);
    const railOrder = orderRail(model, region.layout);
    for (const node of region.layout.nodes.values()) {
      nodeList.push({
        ...requireEntry(model.byId, node.id),
        col: requireEntry(firstColumns, region.prefix) + node.col,
        x: node.x + ox,
        y: node.y + oy,
        region: region.prefix,
        railIndex: rail.length + railOrder.indexOf(node.id),
        depth: region.layout.depthOf(node.id),
      });
    }
    rail.push(...railOrder);
    for (const edge of region.layout.edges) {
      edges.push({
        id: edge.id,
        kind: edge.kind,
        from: edge.from,
        to: edge.to,
        d: formatPathData(edge.commands, ox, oy),
        heads: edge.heads.map((head) => formatPathData(head, ox, oy)),
        region: region.prefix,
        ...(edge.bundle === undefined ? {} : { bundle: edge.bundle }),
        ...(edge.busX === undefined ? {} : { busX: edge.busX + ox }),
        ...(edge.self === undefined ? {} : { self: edge.self }),
        ...(edge.arc === undefined ? {} : { arc: edge.arc }),
        ...(edge.apex === undefined
          ? {}
          : { apex: [edge.apex[0] + ox, edge.apex[1] + oy] as const }),
      });
    }
    findings.push(...region.layout.findings);
  }
  const placedNodes = new Map(nodeList.map((node) => [node.uri, node]));
  const nodeOf = (id: string) => requireEntry(placedNodes, id);

  // Cross-region routes: orthogonal, through the gaps between regions.
  // Bridges between the same two regions each run in a lane of their own
  // through the channels and the gap they share, numbered by their ports
  // where they leave the first region, so none is drawn over another.
  const shelfTops = [
    ...new Set([...placed.values()].map((place) => place.shelfY)),
  ].sort((a, b) => a - b);
  const shelfIndexOf = (prefix: string): number =>
    shelfTops.indexOf(originOf(prefix).shelfY);
  const crossBundles = model.bundles.filter((candidate) => candidate.cross);
  const portOf = (bundle: Bundle, end: string): number =>
    requireEntry(
      regionOf(nodeOf(end).region).layout.ports,
      `${bundle.id} ${end}`,
    ) + originOf(nodeOf(end).region).oy;
  const pairOf = (bundle: Bundle): string =>
    `${nodeOf(bundle.a).region} ${nodeOf(bundle.b).region}`;
  const lanes = new Map<string, { index: number; count: number }>();
  for (const pair of new Set(crossBundles.map(pairOf))) {
    const group = crossBundles
      .filter((bundle) => pairOf(bundle) === pair)
      .sort((x, y) =>
        orderBy(portOf(x, x.a) - portOf(y, y.a), compareText(x.id, y.id)),
      );
    group.forEach((bundle, index) => {
      lanes.set(bundle.id, { index, count: group.length });
    });
  }
  // The gap between two regions side by side on one shelf, with no region
  // between them, when the bridge leaves and enters by the sides that face
  // across it from the columns next to it, so its runs to the gap cross no
  // box.
  const findSharedGap = (
    a: Omit<LaidOutNode, "nav">,
    sideA: "left" | "right",
    b: Omit<LaidOutNode, "nav">,
    sideB: "left" | "right",
  ): { readonly from: number; readonly to: number } | undefined => {
    const span = (prefix: string) => {
      const { x } = originOf(prefix);
      return { left: x, right: x + regionOf(prefix).w };
    };
    const facesGap = (
      node: Omit<LaidOutNode, "nav">,
      side: "left" | "right",
    ): boolean => {
      const { columnOf, columns } = regionOf(node.region).layout;
      return columnOf(node.uri) === (side === "left" ? 0 : columns.length - 1);
    };
    if (sideA === sideB || !facesGap(a, sideA) || !facesGap(b, sideB)) {
      return undefined;
    }
    const [left, right] = sideA === "right" ? [a, b] : [b, a];
    const from = span(left.region).right;
    const to = span(right.region).left;
    const { shelfY } = originOf(left.region);
    const between = [...placed.keys()].some((prefix) => {
      if (prefix === left.region || prefix === right.region) return false;
      const { left: x, right: end } = span(prefix);
      return originOf(prefix).shelfY === shelfY && end > from && x < to;
    });
    return to < from || between ? undefined : { from, to };
  };
  const signs = new Map<string, number>();
  const routes: {
    readonly bundle: Bundle;
    readonly channel: readonly PathCommand[];
    readonly ends: NeighbourBridgeEnds;
    readonly gap: { readonly from: number; readonly to: number } | undefined;
    readonly heads: readonly PathCommand[][];
  }[] = [];
  for (const bundle of crossBundles) {
    const a = nodeOf(bundle.a);
    const b = nodeOf(bundle.b);
    const fromRegion = regionOf(a.region);
    const toRegion = regionOf(b.region);
    const portA = portOf(bundle, bundle.a);
    const portB = portOf(bundle, bundle.b);
    const sideA = requireEntry(crossPorts, `${bundle.id} ${bundle.a}`).side;
    const sideB = requireEntry(crossPorts, `${bundle.id} ${bundle.b}`).side;
    const { index, count } = requireEntry(lanes, bundle.id);
    const laneIn = (room: number): number => offsetLane(index, count, room);
    // The channel beside a box's column on one side, at the bridge's lane:
    // past a subclass bus on the right, before the next column's boxes, or
    // the region's margin left of its first column.
    const channelOf = (
      node: Omit<LaidOutNode, "nav">,
      region: SizedRegion,
      side: "left" | "right",
      sign: number,
    ): number => {
      const { ox, x } = originOf(node.region);
      const col = region.layout.columnOf(node.uri);
      if (side === "right") {
        return (
          ox +
          requireAt(region.layout.columnX, col) +
          requireAt(region.layout.columnWidth, col) +
          CROSS_CHANNEL_OFFSET +
          sign * laneIn(BRIDGE_CHANNEL_ROOM)
        );
      }
      return col === 0
        ? x - SHELF_GAP / 2 + sign * laneIn(BRIDGE_GAP_ROOM)
        : ox +
            requireAt(region.layout.columnX, col - 1) +
            requireAt(region.layout.columnWidth, col - 1) +
            CROSS_CHANNEL_OFFSET +
            sign * laneIn(BRIDGE_CHANNEL_ROOM);
    };
    const startX = sideA === "right" ? a.x + a.w : a.x;
    const endX = sideB === "right" ? b.x + b.w : b.x;
    const gapLane = laneIn(BRIDGE_GAP_ROOM);
    const fromGap = originOf(a.region).shelfY - SHELF_GAP / 2 + gapLane;
    const toGap = originOf(b.region).shelfY - SHELF_GAP / 2 + gapLane;
    // The gap that joins the two shelves: the one above a shared shelf or
    // above the lower of two adjacent ones. Only shelves further apart go
    // round the packing's left margin.
    const step = shelfIndexOf(b.region) - shelfIndexOf(a.region);
    const joiningGap =
      step === 1 ? toGap : step === 0 || step === -1 ? fromGap : undefined;
    // Which way the channels' lanes are numbered: towards the box for a
    // route that runs up from its port, away from it for one that runs
    // down, so the lanes nest instead of crossing. One way for every
    // bridge of a pair, at both ends, so no two of them meet in a channel
    // one leaves by and another enters by.
    const turn =
      (sideA === "left" ? -1 : 1) * ((joiningGap ?? fromGap) < portA ? 1 : -1);
    const sign = signs.get(pairOf(bundle)) ?? turn;
    signs.set(pairOf(bundle), sign);
    const exitX = channelOf(a, fromRegion, sideA, sign);
    const entryX = channelOf(b, toRegion, sideB, sign);
    // Neighbours on one shelf, facing each other: straight across the gap
    // between them, at the bridge's lane, with no detour through the
    // channel above the shelf.
    const gap = step === 0 ? findSharedGap(a, sideA, b, sideB) : undefined;
    const heads: PathCommand[][] = [];
    if (bundle.heads.has(bundle.a))
      heads.push(buildArrowhead(startX, portA, sideA === "left"));
    if (bundle.heads.has(bundle.b))
      heads.push(buildArrowhead(endX, portB, sideB === "left"));
    routes.push({
      bundle,
      channel: [
        ["M", startX, portA],
        ["H", exitX],
        ...(joiningGap === undefined
          ? ([
              ["V", fromGap],
              ["H", -SHELF_GAP / 2 + gapLane],
              ["V", toGap],
            ] as PathCommand[])
          : ([["V", joiningGap]] as PathCommand[])),
        ["H", entryX],
        ["V", portB],
        ["H", endX],
      ],
      ends: { startX, portA, endX, portB },
      gap,
      heads,
    });
  }
  // A pair of neighbours whose bridges all leave and enter by the sides
  // that face across their gap is routed across it, each bridge keeping a
  // stretch of its own; any other pair keeps the channel route with its
  // lanes.
  const across = new Map<string, readonly PathCommand[]>();
  for (const pair of new Set(crossBundles.map(pairOf))) {
    const group = routes.filter((route) => pairOf(route.bundle) === pair);
    const [first] = group;
    if (first?.gap === undefined || group.some(({ gap }) => gap === undefined))
      continue;
    const paths = routeNeighbourBridges(
      group.map(({ ends }) => ends),
      first.gap,
      originOf(nodeOf(first.bundle.a).region).shelfY,
    );
    group.forEach(({ bundle }, index) => {
      across.set(bundle.id, requireAt(paths, index));
    });
  }
  const crossEdges: LaidOutEdge[] = routes.map(
    ({ bundle, channel, heads }) => ({
      id: `rel:${bundle.id}`,
      kind: "relation",
      bridge: true,
      bundle,
      from: bundle.a,
      to: [bundle.b],
      d: formatPathData(across.get(bundle.id) ?? channel),
      heads: heads.map((head) => formatPathData(head)),
      region: nodeOf(bundle.a).region,
    }),
  );
  // A dashed bridge, which no statement instantiates, is drawn after the
  // solid ones, so where it crosses one it is never under it.
  crossEdges.sort(
    (x, y) => Number(x.bundle?.weight === 0) - Number(y.bundle?.weight === 0),
  );
  for (const join of model.joins) {
    const target = nodeOf(join.target);
    const joined = originOf(join.prefix);
    const targetRegion = regionOf(target.region);
    const middles = join.roots.map(
      (root) => nodeOf(root).y + nodeOf(root).h / 2,
    );
    const busX = joined.x - BUS_OFFSET;
    const targetY = target.y + target.h / 2;
    const targetBusX =
      originOf(target.region).ox +
      requireAt(
        targetRegion.layout.columnX,
        targetRegion.layout.columnOf(target.uri),
      ) +
      requireAt(
        targetRegion.layout.columnWidth,
        targetRegion.layout.columnOf(target.uri),
      ) +
      BUS_OFFSET;
    const joinGap = joined.shelfY - SHELF_GAP / 2;
    const targetGap = originOf(target.region).shelfY - SHELF_GAP / 2;
    // As a relation: a superclass on the shelf below is reached down the
    // bus through the gap above it, one on the same shelf or the shelf
    // above through the gap above the joined region; only shelves further
    // apart go round the packing's left margin.
    const step = shelfIndexOf(target.region) - shelfIndexOf(join.prefix);
    const route: PathCommand[] =
      step === 1
        ? [
            ["M", busX, Math.max(...middles)],
            ["V", targetGap],
          ]
        : [
            ["M", busX, Math.min(...middles)],
            ["V", joinGap],
            ...(step === 0 || step === -1
              ? []
              : ([
                  ["H", -SHELF_GAP / 2],
                  ["V", targetGap],
                ] as PathCommand[])),
          ];
    const commands: PathCommand[] = [
      ["M", busX, Math.min(...middles)],
      ["V", Math.max(...middles)],
      ...join.roots.flatMap((root, index): PathCommand[] => [
        ["M", busX, requireAt(middles, index)],
        ["H", nodeOf(root).x],
      ]),
      ...route,
      ["H", targetBusX],
      ["V", targetY],
      ["H", target.x + target.w],
    ];
    // The join enters the root's own subclass port and shares its hollow
    // head when the root already has a bus.
    crossEdges.push({
      id: join.id,
      kind: "subclass",
      from: join.target,
      to: join.roots,
      d: formatPathData(commands),
      heads: model.children.has(join.target)
        ? []
        : [formatPathData(buildArrowhead(target.x + target.w, targetY, false))],
      region: join.prefix,
    });
  }

  // The keyboard's moves: up and down within the column in rail order, left
  // to the superclass (or the first relation predecessor), right to the
  // first subclass (or the first relation successor), home to the root.
  const nodes = new Map<string, LaidOutNode>();
  for (const region of sized) {
    const byRail = (a: string, b: string): number =>
      nodeOf(a).railIndex - nodeOf(b).railIndex;
    for (const id of region.ids) {
      const node = nodeOf(id);
      const column = region.ids
        .filter((other) => nodeOf(other).col === node.col)
        .sort((a, b) => nodeOf(a).y - nodeOf(b).y);
      const index = column.indexOf(id);
      const successors = [
        ...new Set(
          model.drawnRelations
            .filter(
              (relation) =>
                relation.domain === id &&
                relation.range !== id &&
                nodeOf(relation.range).region === region.prefix &&
                region.layout.predecessorsOf(relation.range).includes(id),
            )
            .map((relation) => relation.range),
        ),
      ].sort(byRail);
      const subclasses = [...(model.children.get(id) ?? [])].sort(byRail);
      let root = id;
      for (
        let parent = model.parent.get(root);
        parent !== undefined;
        parent = model.parent.get(root)
      ) {
        root = parent;
      }
      const nav: NodeNavigation = {
        up: index > 0 ? requireAt(column, index - 1) : null,
        down: column.at(index + 1) ?? null,
        left:
          model.parent.get(id) ??
          [...region.layout.predecessorsOf(id)].sort(byRail).at(0) ??
          null,
        right: subclasses.at(0) ?? successors.at(0) ?? null,
        home: root,
      };
      nodes.set(id, { ...node, nav });
    }
  }

  const regions: LaidOutRegion[] = sized.map((region) => {
    const { x, y } = originOf(region.prefix);
    const boxes = region.ids.map((id) => requireEntry(model.byId, id));
    return {
      prefix: region.prefix,
      ids: region.ids,
      x,
      y,
      w: region.w,
      h: region.h,
      columns: region.layout.columns.length,
      members: boxes.reduce((sum, box) => sum + box.members, 0),
      collapsed: boxes.some((box) => box.kind === "region"),
      boxed: boxes.some((box) => box.kind === "region")
        ? orderBoxedClasses(whole, region.prefix)
        : [],
    };
  });
  const allEdges = [...edges, ...crossEdges];
  // Below a pair of neighbours joined straight across their gap, the band
  // a bridge's label too long for so short a route sits in.
  const bands = crossEdges.flatMap((edge): Rect[] => {
    const { bundle } = edge;
    if (bundle === undefined || !across.has(bundle.id)) return [];
    const ends = [nodeOf(bundle.a).region, nodeOf(bundle.b).region];
    const { x, w } = measurePathBounds(edge.d);
    const bottom = Math.max(
      ...regions
        .filter((region) => ends.includes(region.prefix))
        .map((region) => region.y + region.h),
    );
    return [{ x, y: bottom, w, h: BRIDGE_LABEL_BAND }];
  });
  const addMargin = (bounds: Rect): Rect => ({
    x: bounds.x - VIEW_MARGIN,
    y: bounds.y - VIEW_MARGIN,
    w: bounds.w + 2 * VIEW_MARGIN,
    h: bounds.h + 2 * VIEW_MARGIN,
  });
  const drawing = uniteRects([
    ...regions,
    ...crossEdges.map((edge) => measurePathBounds(edge.d)),
    ...bands,
  ]);
  const orderedNodes = new Map(
    [...nodes.entries()].sort(([a], [b]) => compareText(a, b)),
  );
  // A bridge's label with no place within the drawing takes one past it,
  // and the bounds grow to hold it, so every drawn bridge is named at
  // rest: measured as the catalog's English sets it, like the boxes.
  const labelled = placeBridgeLabels(
    {
      nodes: orderedNodes,
      edges: allEdges,
      regions,
      viewBox: addMargin(drawing),
    },
    createTranslator(MEASURED_LOCALE, MESSAGES),
  );
  const viewBox = addMargin(
    uniteRects([drawing, ...labelled.placed.map((label) => label.box)]),
  );
  const fitZoom = Math.min(
    DESIGN_CANVAS.w / viewBox.w,
    DESIGN_CANVAS.h / viewBox.h,
  );
  // A graph that fits only below the legible zoom opens on a legible
  // window of it, so no first paint drops the labels.
  const view = frameOpeningWindow(
    { nodes: orderedNodes, regions, viewBox },
    DESIGN_CANVAS,
  );
  return {
    model,
    nodes: orderedNodes,
    edges: allEdges,
    regions,
    rail,
    viewBox,
    view,
    fitZoom,
    channel,
    findings,
    phone: layOutPhoneView(model, orderedNodes, rail, regions),
  };
}

/**
 * Lay the class graph out: each namespace region in its own layered
 * columns by the layered engine, the regions ordered by their bridges
 * (an opened view's namespace first, then the boxes, largest first, then
 * the one with most relations to those placed) and packed in that order into shelves for the largest fit on the
 * design canvas (retried with narrower channels when the fit would put
 * 14px labels below 12px, which are kept whenever they lift the fit and
 * no arc nests past them), placed on the lattice, then the cross-region
 * relations and subclass joins routed through the gaps, the rail order,
 * the keyboard's moves, the viewBox with its margin, grown to hold a
 * bridge's label with no place within the drawing, the view the canvas
 * opens on (the whole viewBox, or a legible window of it whose edges cut no
 * box when the whole fits only below the legible zoom, which the findings
 * record) and the phone view.
 *
 * Boxes, columns, regions and waypoints sit on the 16px lattice; routes
 * need not. A route runs in the gaps between boxes, and its runs keep
 * half-step offsets from the lattice (a relation into another region 24px
 * into its channel, past the subclass bus at 16px; bridges between the
 * same two regions 8px apart; an arc 16px out, 8px more per nesting), so
 * that in a 48px or 32px channel no two routes share a line: on the
 * lattice the bus and the relation would run as one.
 *
 * It is total over what a provider serves: superclass cycles are broken
 * and an input with no class lays out as an empty floor. It is a pure
 * function of the input, sorted by IRI: no randomness, no
 * trigonometry and no browser measurement, so the server and the client
 * lay out the same graph byte for byte, and every coordinate is an
 * integer.
 *
 * @param input - The classes and relations: the data's, each counted, or a
 *   legend specimen's.
 * @param options - How many barycentre sweeps order the columns (`SWEEPS`
 *   unless given; 0 keeps the label-sorted order, the baseline the
 *   crossings are measured against), and the budget the overview keeps at
 *   rest: with one, the largest namespaces collapse to a box each while
 *   the drawing would exceed its drawn nodes (see `chooseDrawnScope`),
 *   then further, the largest expanded namespace first, while the packed
 *   overview does not fit the design canvas at the legible floor
 *   (`MIN_FIT`), its opening view leaving a region out, so the overview
 *   opens whole; when every namespace is a box and it still does not fit,
 *   it opens on a legible window. That takes at
 *   most one layout more than there are namespaces. A relation to a class
 *   outside the loaded namespaces reaches an external stub. Drilled into
 *   a namespace, it is packed first and drawn class by class, every other
 *   one as a box after it, whatever the fit. At rest and drilled, a layer of more classes than
 *   the budget's band splits into balanced consecutive columns. Without a
 *   budget, every class given is drawn, a layer as one column.
 * @returns The layout. Each class's column is graph-wide: its region's
 *   first column, counted over the regions in packing order, plus its
 *   column in the region.
 */
export default function layOutClassGraph(
  input: ClassGraphInput | SpecimenGraphInput,
  options: ClassGraphLayoutOptions = {},
): ClassGraphLayout {
  const { sweeps = SWEEPS, budget, drill } = options;
  const whole = buildClassGraphModel(input);
  if (budget === undefined) return layOutModel(whole, whole, { sweeps });
  // Wherever a budget holds, at rest and drilled, no column holds more
  // classes than its band: a fuller layer splits.
  const engine = { sweeps, bandMembersMax: budget.bandMembersMax };
  const layOutScope = (scope: DrawnScope, lead?: string): ClassGraphLayout =>
    layOutModel(
      buildClassGraphModel(gatherDrawnInput(input, whole, scope), whole),
      whole,
      engine,
      lead,
    );
  // A drilled view is not held to the fit: the reader chose a part, packed
  // first, and it opens by the overview's rule from that part's corner.
  if (drill !== undefined) {
    return {
      ...layOutScope(chooseDrawnScope(whole, budget, drill), drill),
      drilled: drill,
    };
  }
  // Within the budget's drawn nodes first, then within the canvas: the
  // largest expanded namespace collapses while the overview would open
  // below the legible zoom.
  let scope = chooseDrawnScope(whole, budget);
  let layout = layOutScope(scope);
  while (!opensWhole(layout) && scope.expanded.length > 0) {
    scope = {
      ...scope,
      expanded: scope.expanded.slice(1),
      collapsed: [...scope.collapsed, requireAt(scope.expanded, 0)],
    };
    layout = layOutScope(scope);
  }
  return layout;
}
