import type { MessageKey } from "#i18n";
import type { HopKind, JourneyView, SurfaceRouteName } from "./types.js";

/**
 * The kinds of hop a journey passes through, its columns from left to
 * right: the demand on the left, the surface that answers it on the right.
 * A pairing reaches a layout only when the surface it pairs to composes
 * one, and most do not; the column stays so that absence reads as a gap.
 */
export const HOP_KINDS = [
  "coordinate",
  "job",
  "pairing",
  "surface",
  "layout",
] as const;

/** The message naming each hop kind: a hop's kind, and its legend row's. */
export const HOP_MESSAGES: Readonly<Record<HopKind, MessageKey>> = {
  coordinate: "journeys.hop.coordinate",
  job: "journeys.hop.job",
  pairing: "journeys.hop.pairing",
  surface: "journeys.hop.surface",
  layout: "journeys.hop.layout",
};

/** The legend's line for each hop kind: what its column means. */
export const LEGEND_MESSAGES: Readonly<Record<HopKind, MessageKey>> = {
  coordinate: "journeys.legend.coordinate",
  job: "journeys.legend.job",
  pairing: "journeys.legend.pairing",
  surface: "journeys.legend.surface",
  layout: "journeys.legend.layout",
};

/**
 * The words each kind of surface reads as, by the GraphQL type the surface
 * resolves to. A type is a schema's name, never a reader's word: a kind the
 * map does not hold is left unsaid rather than printed as its type name.
 */
export const SURFACE_TYPE_MESSAGES: ReadonlyMap<string, MessageKey> = new Map<
  string,
  MessageKey
>([
  ["LensSurface", "journeys.surfaceType.lens"],
  ["View", "journeys.surfaceType.view"],
  ["Detail", "journeys.surfaceType.detail"],
  ["Peek", "journeys.surfaceType.peek"],
  ["Mechanism", "journeys.surfaceType.mechanism"],
  ["ComposerSurface", "journeys.surfaceType.composer"],
  ["Editor", "journeys.surfaceType.editor"],
  ["Port", "journeys.surfaceType.port"],
]);

/**
 * The words a pairing's role reads as, by the role term's folded local
 * name (`foldTermName`), so either spelling of the term finds its words.
 */
export const ROLE_MESSAGES: ReadonlyMap<string, MessageKey> = new Map<
  string,
  MessageKey
>([
  ["primary", "journeys.role.primary"],
  ["secondary", "journeys.role.secondary"],
]);

/**
 * The words an arrival reads as, by the preservation term's folded local
 * name (`foldTermName`).
 */
export const ARRIVAL_MESSAGES: ReadonlyMap<string, MessageKey> = new Map<
  string,
  MessageKey
>([
  ["coldentry", "journeys.arrival.coldEntry"],
  ["subjectkept", "journeys.arrival.subjectKept"],
  ["viewkept", "journeys.arrival.viewKept"],
  ["nomove", "journeys.arrival.noMove"],
]);

/** The two readings of the demand model, in the switch's order. */
export const JOURNEY_VIEWS: readonly JourneyView[] = ["table", "graph"];

/**
 * The reading a page opens on when its address names none: the table, the
 * index of every job.
 */
export const DEFAULT_JOURNEY_VIEW: JourneyView = "table";

/** The search parameter both journeys routes keep the view in. */
export const JOURNEY_VIEW_PARAM = "view";

/**
 * The site routes the demand model's surfaces land on, by the surface
 * URI's local name, as the docs graph writes it. A surface with no entry
 * has no page on the site, and the inspector, the table and the graph show
 * it as plain text rather than a dead link. Each entry is a route's name,
 * never a path, so a link follows the router wherever it mounts the site.
 * Hand-maintained and short: inventing a route from a URI pattern would
 * produce links to pages that do not exist.
 */
export const SURFACE_ROUTES: ReadonlyMap<string, SurfaceRouteName> = new Map([
  ["view.home", "home"],
  ["view.components", "components"],
  ["view.definitions", "definitions"],
  ["view.standards", "standards"],
  ["view.guides", "guides"],
  ["view.playground", "playground"],
  ["view.journeys", "journeys"],
]);
