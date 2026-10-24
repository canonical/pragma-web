import type { HOP_KINDS } from "./constants.js";

/**
 * Which reading of the demand model the canvas shows: the table, every job
 * at once, or the graph, the journeys of one coordinate. It is the
 * reader's passing choice and never enters the URL.
 */
export type JourneyView = "table" | "graph";

/**
 * The name of a site route a surface can land on: every one takes no
 * parameter, so a link builds its path from the name alone.
 */
export type SurfaceRouteName =
  | "home"
  | "components"
  | "definitions"
  | "standards"
  | "guides";

/** One of the journey's columns, from `HOP_KINDS`: what a hop stands for. */
export type HopKind = (typeof HOP_KINDS)[number];

/** A surface a pairing reaches, with the layout it composes, if any. */
export interface JourneySurface {
  readonly uri: string;
  readonly label?: string | null | undefined;
  /** The concrete `Surface` implementor, such as `View` or `Port`. */
  readonly surfaceType?: string | null | undefined;
  /** The name of the site route the surface lives at, when there is one. */
  readonly route?: SurfaceRouteName | null | undefined;
  readonly layout?:
    | { readonly uri: string; readonly label?: string | null | undefined }
    | null
    | undefined;
}

/** One pairing of a job with the surface that serves it. */
export interface JourneyPairing {
  readonly uri: string;
  readonly label?: string | null | undefined;
  /** The pairing's role URI (Primary or Secondary). */
  readonly role?: string | null | undefined;
  /** The pairing's arrival URI; many pairings carry none, by rule. */
  readonly arrival?: string | null | undefined;
  readonly surface?: JourneySurface | null | undefined;
}

/** One job, with every pairing that serves it. */
export interface JourneyJob {
  readonly uri: string;
  readonly label?: string | null | undefined;
  /** The job's story, verbatim, or undefined when the graph holds none. */
  readonly story?: string | null | undefined;
  readonly pairings: readonly JourneyPairing[];
}

/** One coordinate, the root of the jobs it holds. */
export interface JourneyCoordinate {
  readonly uri: string;
  readonly label?: string | null | undefined;
  readonly jobs: readonly JourneyJob[];
}

/**
 * One hop's payload, every member read off the graph: a pairing's role and
 * arrival are its own URIs, and a surface's route is set only where the
 * docsite renders that surface.
 */
export interface JourneyNodeData {
  /** The hop's graph URI: its identity and its address. */
  readonly uri: string;
  /** The graph's own label for the hop. */
  readonly label: string;
  /** The column the hop sits in. */
  readonly kind: HopKind;
  /** The concrete `Surface` implementor, for a surface hop only. */
  readonly surfaceType?: string | undefined;
  /** The pairing's role URI, for a pairing hop only. */
  readonly role?: string | undefined;
  /** The pairing's arrival URI, for a pairing hop only; may be absent. */
  readonly arrival?: string | undefined;
  /** The name of a surface hop's site route, when the site renders one. */
  readonly route?: SurfaceRouteName | undefined;
}

/** The selected job, joined against the model: what the inspector shows. */
export interface InspectedJob {
  readonly uri: string;
  readonly label: string;
  /** The job's story, verbatim: the reader's own words. */
  readonly story: string | undefined;
  /** The job's acceptance criteria, each verbatim. */
  readonly acceptances: readonly string[];
  /** The coordinate, spelled out in words. */
  readonly coordinate: string;
  /** Every pairing that serves the job. */
  readonly pairings: readonly JourneyPairing[];
}
