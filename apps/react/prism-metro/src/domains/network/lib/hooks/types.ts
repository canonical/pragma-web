import type { DiagramLine } from "../geometry/index.js";
import type { LineView, StationView } from "../types.js";

/** `useNetworkLines` takes nothing: the map query reads the whole network. */
export type UseNetworkLinesProps = Record<string, never>;

/** The network's lines, as the map draws them. */
export type UseNetworkLinesResult = readonly DiagramLine[];

/** What `useNetworkNodeId` reads an IRI from. */
export interface UseNetworkNodeIdProps {
  /** The page's address from the route, compact or absolute. */
  readonly address: string;
}

/** The IRI the address names. */
export type UseNetworkNodeIdResult = string;

/** What `useStationView` reads a station by. */
export interface UseStationViewProps {
  /** The station's address from the route, compact or absolute. */
  readonly address: string;
}

/** The station's page view, or undefined when the graph has no such station. */
export type UseStationViewResult = StationView | undefined;

/** What `useLineView` reads a line by. */
export interface UseLineViewProps {
  /** The line's address from the route, compact or absolute. */
  readonly address: string;
}

/** The line's page view, or undefined when the graph has no such line. */
export type UseLineViewResult = LineView | undefined;
