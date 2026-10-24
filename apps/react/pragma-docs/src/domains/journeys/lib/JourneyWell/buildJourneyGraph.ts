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
 * force simulation, and it stays exactly reproducible. Columns are 240
 * units apart and rows 64, so every corner sits on a lattice dot.
 *
 * SORTING IS EXPLICIT. The graph's result order is insertion order and is
 * byte-identical across fresh stores, but this function does not trust
 * that: every collection it walks is sorted by URI first. A layout that
 * silently depended on server iteration order would be a hydration bug
 * waiting for the day the store changes.
 *
 * HONEST ABSENCE. Most surfaces compose no layout — 16 of 133
 * pairings reach one. Where a journey has no layout hop, this function
 * emits NO layout node and NO trailing edge, and the row simply ends at
 * its surface. It does NOT invent one by walking the `within` chain: the
 * ontology declares no layout-inheritance rule, and a lens that applied
 * one would be asserting something the model does not say. The empty
 * column is the signal — it reads as a coverage gap to fix upstream,
 * which is exactly what it is.
 */

import { snapToLattice } from "#lib/graph";
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

  return { nodes, edges };
};

/**
 * The local name of a vocabulary URI. The demand model's vocabulary terms
 * arrive in TWO forms depending on how the store resolved them — full
 * (`sem://surface#Primary`) or prefixed (`surface:Primary`) — so the
 * separator is either `#` or `:`. Splitting on both is what keeps the
 * mapping honest against real responses rather than against one sample.
 */
const readLocalName = (uri: string): string | undefined => {
  const local = uri.split(/[#:]/).at(-1);
  return local === undefined || local.length === 0 ? undefined : local;
};

/**
 * Edge weight from the pairing's role. `PairingRole` is an OBJECT type
 * carrying a URI, not a GraphQL enum, so the mapping is by local name —
 * and an unrecognised role decorates nothing rather than guessing.
 */
export const classifyRole = (
  role: string | null | undefined,
): string | undefined => {
  if (role == null) return undefined;
  const local = readLocalName(role);
  if (local === "Primary") return ROLE_PRIMARY_CLASS;
  if (local === "Secondary") return ROLE_SECONDARY_CLASS;
  return undefined;
};

/**
 * Edge decoration from the pairing's arrival, by local name for the same
 * reason. Absent arrival decorates nothing: 34 of 133 pairings carry none
 * and ports carry none by rule, so "no class" is the honest rendering of
 * a fact rather than a fallback.
 */
export const classifyArrival = (
  arrival: string | null | undefined,
): string | undefined => {
  if (arrival == null) return undefined;
  const local = readLocalName(arrival);
  if (local === undefined) return undefined;
  return `${ARRIVAL_CLASS_PREFIX}${local.toLowerCase()}`;
};
