/**
 * The journey well's DETERMINISTIC layout: the demand model's coordinate →
 * job → pairing → surface → layout spine in, a fully-positioned node/edge
 * model out. Pure — same input, byte-equal output
 * (`buildJourneyGraph.tests.ts` pins it) — because the positions must be
 * computed identically on the server and the client: the well draws the
 * graph as SVG from these positions on both, so any nondeterminism here
 * surfaces as a hydration mismatch.
 *
 * LAYOUT MODEL — the hierarchy well transposed. There, ontologies are
 * blocks of layers running top-down; here the journey runs LEFT TO RIGHT,
 * because a journey is a path and a path reads along the line of text:
 *
 *   x = the hop's column   (coordinate | job | pairing | surface | layout)
 *   y = the row the journey occupies
 *
 * Edges follow the axis: a hop's edge leaves its right edge and lands on
 * the next hop's left edge, so the well computes every path server-side.
 *
 * ROWS ARE ALLOCATED, NEVER MEASURED. Each journey (one coordinate → one
 * job → one pairing → …) claims a row; a node shared by several rows (the
 * coordinate every job hangs off, a surface two jobs both reach) is placed
 * ONCE, at the mean of the rows it serves, snapped down to the 16-unit
 * lattice. That keeps a shared node between its dependents without any
 * force simulation, and it stays exactly reproducible. Where that mean is
 * another node's row, the lower of the two moves down to the next free
 * row of its column, so no two boxes overlap. Columns are 240 units apart
 * and rows 64, so every corner sits on a lattice dot.
 *
 * SORTING IS EXPLICIT. The graph's result order is insertion order and is
 * byte-identical across fresh stores, but this function does not trust
 * that: every collection it walks is sorted by URI first. A layout that
 * silently depended on server iteration order would be a hydration bug
 * waiting for the day the store changes.
 *
 * HONEST ABSENCE. Not every surface composes a layout — the chips, the
 * palette and the GraphQL port do not, so 10 of the docs site's 30
 * pairings reach none. Where a journey has no layout hop, this function
 * emits NO layout node and NO trailing edge, and the row simply ends at
 * its surface. It does NOT invent one by walking the `within` chain: the
 * ontology declares no layout-inheritance rule, and a lens that applied
 * one would be asserting something the model does not say. The empty
 * column is the signal — it reads as a coverage gap to fix upstream,
 * which is exactly what it is.
 */

import { snapToLattice } from "#lib/graph";
import { foldTermName, readLocalName } from "../../collectJourneys.js";
import type {
  HopKind,
  JourneyCoordinate,
  SurfaceRouteName,
} from "../../types.js";
import {
  ARRIVAL_CLASS_PREFIX,
  COLUMN_PITCH,
  NODE_HEIGHT,
  NODE_WIDTH,
  ROLE_PRIMARY_CLASS,
  ROLE_SECONDARY_CLASS,
  ROW_PITCH,
} from "./constants.js";
import type { JourneyGraphEdge, JourneyGraphNode } from "./types.js";

/** The column index of each hop kind — the x axis, in one place. */
const COLUMN_INDEX: Readonly<Record<HopKind, number>> = {
  coordinate: 0,
  job: 1,
  pairing: 2,
  surface: 3,
  layout: 4,
};

/** A node's x from its column: constant stride, no measurement. */
const findColumnX = (kind: HopKind): number =>
  COLUMN_INDEX[kind] * COLUMN_PITCH;

/**
 * A node's y from the mean of its rows, snapped down to the lattice. A
 * mean that lands on a lattice step is a multiple of a quarter row, a
 * binary fraction, so integer division computes it exactly and the snap is
 * bit-identical wherever it runs; any other mean is floored well clear of
 * a step.
 */
const findRowY = (meanRow: number): number =>
  snapToLattice(meanRow * ROW_PITCH);

/** The positioned graph the well draws, deterministic. */
export interface JourneyGraph {
  readonly nodes: readonly JourneyGraphNode[];
  readonly edges: readonly JourneyGraphEdge[];
}

/** Sort a collection by URI — the explicit order the layout depends on. */
const sortByUri = <T extends { readonly uri: string }>(
  items: readonly T[],
): readonly T[] =>
  [...items].sort((a, b) => (a.uri < b.uri ? -1 : a.uri > b.uri ? 1 : 0));

/**
 * A node under construction: its data plus every row it participates in,
 * so a shared node can be centred once all its rows are known.
 */
interface Placement {
  readonly kind: HopKind;
  readonly label: string;
  readonly surfaceType?: string | undefined;
  readonly role?: string | undefined;
  readonly arrival?: string | undefined;
  readonly route?: SurfaceRouteName | undefined;
  readonly rows: number[];
}

/**
 * Build the positioned journey graph. Node ids are the graph's own URIs —
 * the same strings the routes address — so selection and links need no
 * translation.
 *
 * The walk allocates one row per (job, pairing) leaf, which is what makes
 * the diagram a set of PATHS rather than a cloud: every row is one
 * readable left-to-right sentence.
 */
export const buildJourneyGraph = (
  coordinates: readonly JourneyCoordinate[],
): JourneyGraph => {
  const placements = new Map<string, Placement>();
  const edgeIds = new Set<string>();
  const edges: JourneyGraphEdge[] = [];
  let row = 0;

  /** Record a node's presence on a row, creating it on first sight. */
  const place = (
    uri: string,
    seed: Omit<Placement, "rows">,
    onRow: number,
  ): void => {
    const existing = placements.get(uri);
    if (existing === undefined) {
      placements.set(uri, { ...seed, rows: [onRow] });
      return;
    }
    existing.rows.push(onRow);
  };

  /** Connect two hops once; a repeated pair is the same edge, not a second. */
  const connect = (
    source: string,
    target: string,
    className?: string,
  ): void => {
    const id = `${source}=>${target}`;
    if (edgeIds.has(id)) return;
    edgeIds.add(id);
    edges.push({
      id,
      source,
      target,
      ...(className === undefined ? {} : { className }),
    });
  };

  for (const coordinate of sortByUri(coordinates)) {
    for (const job of sortByUri(coordinate.jobs)) {
      const pairings = sortByUri(job.pairings);
      // A job with no pairings still earns a row: it is demand nothing
      // serves, which is precisely the thing worth seeing.
      if (pairings.length === 0) {
        place(
          coordinate.uri,
          { kind: "coordinate", label: coordinate.label ?? coordinate.uri },
          row,
        );
        place(job.uri, { kind: "job", label: job.label ?? job.uri }, row);
        connect(coordinate.uri, job.uri);
        row += 1;
        continue;
      }

      for (const pairing of pairings) {
        place(
          coordinate.uri,
          { kind: "coordinate", label: coordinate.label ?? coordinate.uri },
          row,
        );
        place(job.uri, { kind: "job", label: job.label ?? job.uri }, row);
        place(
          pairing.uri,
          {
            kind: "pairing",
            label: pairing.label ?? pairing.uri,
            role: pairing.role ?? undefined,
            arrival: pairing.arrival ?? undefined,
          },
          row,
        );
        connect(coordinate.uri, job.uri);
        // Role decorates the edge into the pairing — weight, never position.
        connect(job.uri, pairing.uri, classifyRole(pairing.role));

        const surface = pairing.surface;
        if (surface != null) {
          place(
            surface.uri,
            {
              kind: "surface",
              label: surface.label ?? surface.uri,
              surfaceType: surface.surfaceType ?? undefined,
              route: surface.route ?? undefined,
            },
            row,
          );
          connect(pairing.uri, surface.uri, classifyArrival(pairing.arrival));

          // HONEST ABSENCE: only when the surface genuinely composes one.
          const layout = surface.layout;
          if (layout != null) {
            place(
              layout.uri,
              { kind: "layout", label: layout.label ?? layout.uri },
              row,
            );
            connect(surface.uri, layout.uri);
          }
        }
        row += 1;
      }
    }
  }

  const nodes: JourneyGraphNode[] = [];
  for (const [uri, placement] of placements) {
    // A shared node stands on the mean of its rows, between the journeys
    // it serves, snapped to the lattice.
    const mean =
      placement.rows.reduce((sum, value) => sum + value, 0) /
      placement.rows.length;
    nodes.push({
      id: uri,
      x: findColumnX(placement.kind),
      y: findRowY(mean),
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      data: {
        uri,
        label: placement.label,
        kind: placement.kind,
        surfaceType: placement.surfaceType,
        role: placement.role,
        arrival: placement.arrival,
        route: placement.route,
      },
    });
  }

  return { nodes: separateColumns(nodes), edges };
};

/**
 * Keep the hops of one column clear of each other. A shared hop stands on
 * the mean of its rows, and that mean can be the very row another hop of
 * its column stands on, so two boxes would be drawn one over the other.
 * Walking each column from the top, a hop that starts less than a row's
 * pitch below the hop above it moves down to that pitch: the next free
 * lattice row, a box's height and a lattice step of gap below it. A hop's
 * column never changes, and the walk takes the hops in the order of their
 * rows, ties in the order the layout placed them, so the result stays a
 * pure function of the data.
 *
 * @param nodes - The placed hops, in the order the layout placed them.
 * @returns The hops by column, then from the top, none within a row's
 *   pitch of the one above it.
 */
function separateColumns(
  nodes: readonly JourneyGraphNode[],
): readonly JourneyGraphNode[] {
  const floors = new Map<number, number>();
  return [...nodes]
    .sort((a, b) => a.x - b.x || a.y - b.y)
    .map((node) => {
      const y = Math.max(node.y, floors.get(node.x) ?? node.y);
      floors.set(node.x, y + ROW_PITCH);
      return y === node.y ? node : { ...node, y };
    });
}

/**
 * Edge weight from the pairing's role. `PairingRole` is an OBJECT type
 * carrying a URI, not a GraphQL enum, so the mapping is by local name —
 * and an unrecognised role decorates nothing rather than guessing. The
 * demand model's vocabulary terms arrive in TWO forms depending on how the
 * store resolved them — full (`sem://surface#primary`) or prefixed
 * (`surface:primary`) — and `readLocalName` reads both; the local name's
 * case and underscores do not matter (`foldTermName`).
 */
export const classifyRole = (
  role: string | null | undefined,
): string | undefined => {
  if (role == null) return undefined;
  const term = foldTermName(readLocalName(role));
  if (term === "primary") return ROLE_PRIMARY_CLASS;
  if (term === "secondary") return ROLE_SECONDARY_CLASS;
  return undefined;
};

/**
 * Edge decoration from the pairing's arrival, by local name for the same
 * reason. Absent arrival decorates nothing: ports carry none by rule (2 of
 * the docs site's 30 pairings), so "no class" is the honest rendering of
 * a fact rather than a fallback.
 */
export const classifyArrival = (
  arrival: string | null | undefined,
): string | undefined => {
  if (arrival == null) return undefined;
  const local = readLocalName(arrival);
  // An arrival whose local name is empty names no term: the shared reading
  // returns the whole URI then, which ends at its separator.
  if (/[#:]$/.test(local)) return undefined;
  return `${ARRIVAL_CLASS_PREFIX}${foldTermName(local)}`;
};
