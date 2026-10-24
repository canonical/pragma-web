import type { JourneyCoordinate, JourneyNodeData } from "../types.js";

/** One hop placed: its top-left corner, its size and its payload. */
export interface JourneyGraphNode {
  /** The hop's graph URI. */
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly data: JourneyNodeData;
}

/** One edge between two hops, with the class its pairing decorates it by. */
export interface JourneyGraphEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly className?: string;
}

/**
 * Props of the journey well: the coordinates it lays out and draws, and the
 * job whose hop it marks as selected.
 */
export interface JourneyWellProps {
  /** Additional CSS class names. */
  className?: string;
  /**
   * The coordinates to draw — already filtered by the explorer. The well
   * lays out exactly what it is given: filtering is the caller's job, and
   * a filtered view is the lens's DEFAULT (see `journeyFilter.ts` for why
   * virtualisation is not an option here).
   */
  readonly coordinates: readonly JourneyCoordinate[];
  /** The selected job (prefixed URI), or undefined on `/journeys`. */
  readonly job: string | undefined;
}
