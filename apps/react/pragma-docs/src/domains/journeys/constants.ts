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

/** The two readings of the demand model, in the switch's order. */
export const JOURNEY_VIEWS: readonly JourneyView[] = ["table", "graph"];

/**
 * The reading a page opens on: the table, the index of every job. It is a
 * constant, read from nothing, so the server's first paint and the
 * client's first render agree.
 */
export const DEFAULT_JOURNEY_VIEW: JourneyView = "table";

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
]);
