import readLineView from "../src/domains/network/lib/readLineView.js";
import readStationView from "../src/domains/network/lib/readStationView.js";
import type {
  LineView,
  StationView,
} from "../src/domains/network/lib/types.js";
import type { NetworkLineQuery$data } from "../src/relay/__generated__/NetworkLineQuery.graphql.js";
import type { NetworkStationQuery$data } from "../src/relay/__generated__/NetworkStationQuery.graphql.js";
import { METRO_NAMESPACE } from "./fixtures.js";
import networkResponses from "./records/networkResponses.js";

/** The recorded answer to `operation` for the node at `local`. */
const readRecordedNode = (operation: string, local: string): unknown => {
  const entry = networkResponses.find(
    (each) =>
      each.operation === operation &&
      each.variables.id === `${METRO_NAMESPACE}${local}`,
  );
  if (entry === undefined) {
    throw new Error(`no recorded ${operation} for ${local}`);
  }
  return (entry.response.data as { readonly node: unknown }).node;
};

/**
 * Read a recorded station's page view, as the station page shows it.
 *
 * @param local - The station's local name: `tannery-lane` or `northgate`.
 * @returns The view.
 * @throws When no answer is recorded for the station, or it is no station.
 */
export function readRecordedStation(local: string): StationView {
  const view = readStationView(
    readRecordedNode("NetworkStationQuery", local) as NonNullable<
      NetworkStationQuery$data["node"]
    >,
  );
  if (view === undefined) throw new Error(`${local} is no station`);
  return view;
}

/**
 * Read a recorded line's page view, as the line page shows it.
 *
 * @param local - The line's local name: `circle-line` or `north-line`.
 * @returns The view.
 * @throws When no answer is recorded for the line, or it is no line.
 */
export function readRecordedLine(local: string): LineView {
  const view = readLineView(
    readRecordedNode("NetworkLineQuery", local) as NonNullable<
      NetworkLineQuery$data["node"]
    >,
  );
  if (view === undefined) throw new Error(`${local} is no line`);
  return view;
}
