/** An axis-aligned box addressed by its CENTRE, the shape a well's node takes. */
export interface WellBox {
  x: number;
  y: number;
  readonly width: number;
  readonly height: number;
}

/** Options for `relaxBoxes`. */
export interface RelaxOptions {
  /** Breathing room enforced between boxes. */
  readonly gap: number;
  /** Upper bound on passes; the loop exits early once nothing moves. */
  readonly iterations: number;
  /** Indexes that never move (subjects, anchors). */
  readonly pinned?: ReadonlySet<number>;
}

/** A point in a well's coordinate space, in px. */
export interface WellPoint {
  readonly x: number;
  readonly y: number;
}

/** A quadratic arc's path plus its label anchor (the apex, lifted). */
export interface QuadArc {
  readonly d: string;
  readonly labelAt: WellPoint;
}
