import buildClassGraphModel from "./buildClassGraphModel.js";
import {
  ALIGNMENT_SEARCH_LIMIT,
  BUS_OFFSET,
  CHANNEL,
  DESIGN_CANVAS,
  FALLBACK_CHANNEL,
  LATTICE,
  MIN_FIT,
  REGION_ALIGNMENTS,
  REGION_LABEL_ROW,
  SHELF_ALIGNMENTS,
  SHELF_GAP,
  SWEEPS,
  VIEW_MARGIN,
} from "./constants.js";
import frameLegibleWindow from "./frameLegibleWindow.js";
import {
  buildArrowhead,
  ceilTo,
  compareText,
  formatPathData,
  measurePathBounds,
  measureRegionLabelWidth,
  roundTo,
  uniteRects,
} from "./geometry.js";
import layOutPhoneView from "./layOutPhoneView.js";
import layOutRegion from "./layOutRegion.js";
import orderRail from "./orderRail.js";
import packShelves from "./packShelves.js";
import { requireAt, requireDefined, requireEntry } from "./require.js";
import type {
  ClassGraphInput,
  ClassGraphLayout,
  ClassGraphModel,
  LaidOutEdge,
  LaidOutNode,
  LaidOutRegion,
  NodeNavigation,
  PathCommand,
  RegionLayout,
  ShelfPacking,
} from "./types.js";

/** A region laid out in its own coordinates, with its packed size. */
interface SizedRegion {
  readonly prefix: string;
  readonly ids: readonly string[];
  readonly layout: RegionLayout;
  readonly w: number;
  readonly h: number;
}

/** Lay every region out at a channel and pack them into shelves. */
function packRegions(
  model: ClassGraphModel,
  channel: number,
  sweeps: number,
): {
  readonly regions: readonly SizedRegion[];
  readonly packing: ShelfPacking;
} {
  const regions = model.regionOrder.map(({ prefix, ids }) => {
    const layout = layOutRegion(model, ids, channel, sweeps);
    const labelWidth = measureRegionLabelWidth(prefix, ids.length);
    return {
      prefix,
      ids,
      layout,
      w: ceilTo(
        Math.max(layout.content.x + layout.content.w, labelWidth),
        LATTICE,
      ),
      h: ceilTo(
        REGION_LABEL_ROW + layout.content.y + layout.content.h,
        LATTICE,
      ),
    };
  });
  return { regions, packing: packShelves(regions) };
}

/** Where a region sits: its top-left corner and its shelf's top. */
interface RegionPlace {
  readonly x: number;
  readonly y: number;
  readonly shelfY: number;
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
 * Lay the class graph out: each namespace region in its own layered
 * columns, the regions packed into shelves for the largest fit on the
 * design canvas (retried with narrower channels when the fit would put
 * 14px labels below 12px, which are kept only when they lift it to the
 * legible zoom), placed on the lattice, then the cross-region
 * relations and subclass joins routed through the gaps, the rail order,
 * the keyboard's moves, the viewBox with its margin, the view the canvas
 * opens on (the whole viewBox, or a legible window of it whose edges cut no
 * box when the whole fits only below the legible zoom, which the findings
 * record) and the phone view.
 *
 * It is total over what a provider serves: superclass cycles are broken
 * and an input with no class lays out as an empty floor. It is a pure
 * function of the input, sorted by IRI: no randomness, no
 * trigonometry and no browser measurement, so the server and the client
 * lay out the same graph byte for byte, and every coordinate is an
 * integer.
 *
 * @param input - The classes and relations.
 * @param sweeps - How many barycentre sweeps order the columns; 0 keeps
 *   the label-sorted order, the baseline the crossings are measured against.
 * @returns The layout.
 */
export default function layOutClassGraph(
  input: ClassGraphInput,
  sweeps: number = SWEEPS,
): ClassGraphLayout {
  const model = buildClassGraphModel(input);
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
  let channel = CHANNEL;
  let packed = packRegions(model, channel, sweeps);
  if (packed.packing.fit < MIN_FIT) {
    const retry = packRegions(model, FALLBACK_CHANNEL, sweeps);
    findings.push(
      `G3: fit ${packed.packing.fit.toFixed(3)} at ${CHANNEL}px channels; ${retry.packing.fit.toFixed(3)} at ${FALLBACK_CHANNEL}px`,
    );
    // The narrower channels crowd the arcs that nest in them, so they are
    // taken only when they bring the graph to the legible zoom; short of
    // it, the canvas opens on a window either way.
    if (retry.packing.fit >= MIN_FIT) {
      packed = retry;
      channel = FALLBACK_CHANNEL;
    }
    if (packed.packing.fit < MIN_FIT)
      findings.push("G3: opens on a legible window, the rest a pan away");
  }
  const { regions: sized, packing } = packed;

  // Place the regions: shelves 48px apart, each region shorter than its
  // shelf aligned to its top, middle or bottom, whichever leaves the
  // fewest empty cells on the canvas.
  const placed = alignShelves(sized, packing);
  const originOf = (prefix: string) => {
    const place = requireEntry(placed, prefix);
    return { ...place, ox: place.x, oy: place.y + REGION_LABEL_ROW };
  };

  const nodeList: Omit<LaidOutNode, "nav">[] = [];
  const edges: LaidOutEdge[] = [];
  const rail: string[] = [];
  for (const region of sized) {
    const { ox, oy } = originOf(region.prefix);
    const order = orderRail(model, region.layout);
    for (const node of region.layout.nodes.values()) {
      nodeList.push({
        ...requireEntry(model.byId, node.id),
        col: node.col,
        x: node.x + ox,
        y: node.y + oy,
        region: region.prefix,
        railIndex: rail.length + order.indexOf(node.id),
        depth: region.layout.depthOf(node.id),
      });
    }
    rail.push(...order);
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
  const regionOf = (prefix: string): SizedRegion =>
    requireEntry(
      new Map(sized.map((region) => [region.prefix, region])),
      prefix,
    );

  // Cross-region routes: orthogonal, through the gaps between regions.
  const shelfTops = [
    ...new Set([...placed.values()].map((place) => place.shelfY)),
  ].sort((a, b) => a - b);
  const shelfIndexOf = (prefix: string): number =>
    shelfTops.indexOf(originOf(prefix).shelfY);
  const crossEdges: LaidOutEdge[] = [];
  for (const bundle of model.bundles.filter((candidate) => candidate.cross)) {
    const a = nodeOf(bundle.a);
    const b = nodeOf(bundle.b);
    const fromRegion = regionOf(a.region);
    const toRegion = regionOf(b.region);
    const portA =
      requireEntry(fromRegion.layout.ports, `${bundle.id} ${bundle.a}`) +
      originOf(a.region).oy;
    const portB =
      requireEntry(toRegion.layout.ports, `${bundle.id} ${bundle.b}`) +
      originOf(b.region).oy;
    const exitX =
      originOf(a.region).ox +
      requireAt(fromRegion.layout.columnX, a.col) +
      requireAt(fromRegion.layout.columnWidth, a.col) +
      channel / 2;
    const fromGap = originOf(a.region).shelfY - SHELF_GAP / 2;
    const toGap = originOf(b.region).shelfY - SHELF_GAP / 2;
    const entryX =
      b.col === 0
        ? originOf(b.region).x - SHELF_GAP / 2
        : originOf(b.region).ox +
          requireAt(toRegion.layout.columnX, b.col) -
          channel / 2;
    // The gap that joins the two shelves: the one above a shared shelf or
    // above the lower of two adjacent ones. Only shelves further apart go
    // round the packing's left margin.
    const step = shelfIndexOf(b.region) - shelfIndexOf(a.region);
    const joiningGap =
      step === 1 ? toGap : step === 0 || step === -1 ? fromGap : undefined;
    const commands: PathCommand[] = [
      ["M", a.x + a.w, portA],
      ["H", exitX],
      ...(joiningGap === undefined
        ? ([
            ["V", fromGap],
            ["H", -SHELF_GAP / 2],
            ["V", toGap],
          ] as PathCommand[])
        : ([["V", joiningGap]] as PathCommand[])),
      ["H", entryX],
      ["V", portB],
      ["H", b.x],
    ];
    const heads: PathCommand[][] = [];
    if (bundle.heads.has(bundle.a))
      heads.push(buildArrowhead(a.x + a.w, portA, false));
    if (bundle.heads.has(bundle.b))
      heads.push(buildArrowhead(b.x, portB, true));
    crossEdges.push({
      id: `rel:${bundle.id}`,
      kind: "relation",
      bundle,
      from: bundle.a,
      to: [bundle.b],
      d: formatPathData(commands),
      heads: heads.map((head) => formatPathData(head)),
      region: a.region,
    });
  }
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
      requireAt(targetRegion.layout.columnX, target.col) +
      requireAt(targetRegion.layout.columnWidth, target.col) +
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
    return {
      prefix: region.prefix,
      ids: region.ids,
      x,
      y,
      w: region.w,
      h: region.h,
      columns: region.layout.columns.length,
    };
  });
  const allEdges = [...edges, ...crossEdges];
  const bounds = uniteRects([
    ...regions,
    ...crossEdges.map((edge) => measurePathBounds(edge.d)),
  ]);
  const viewBox = {
    x: bounds.x - VIEW_MARGIN,
    y: bounds.y - VIEW_MARGIN,
    w: bounds.w + 2 * VIEW_MARGIN,
    h: bounds.h + 2 * VIEW_MARGIN,
  };
  const orderedNodes = new Map(
    [...nodes.entries()].sort(([a], [b]) => compareText(a, b)),
  );
  const fitZoom = Math.min(
    DESIGN_CANVAS.w / viewBox.w,
    DESIGN_CANVAS.h / viewBox.h,
  );
  // A graph that fits only below the legible zoom opens on a legible
  // window of it, so no first paint drops the labels.
  const view = frameLegibleWindow(
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
