import { routeLensFacet } from "@canonical/prism-core";
import { readUriParam } from "@canonical/prism-lens-entity";
import { route } from "@canonical/router-core";
import type { ReactElement } from "react";
import { NETWORK_LENS } from "./constants.js";
import { NetworkIcon } from "./lib/NetworkIcon/index.js";
import { NetworkLinePage } from "./lib/NetworkLinePage/index.js";
import { NetworkMap } from "./lib/NetworkMap/index.js";
import { NetworkStationPage } from "./lib/NetworkStationPage/index.js";
import warmNetwork from "./warmNetwork.js";
import warmNetworkNode from "./warmNetworkNode.js";

// Every lens domain keeps its route tables in a `routes` barrel, the one file
// the site's route table reads a lens from.

/** The params a route's content receives from the router. */
type RouteContentProps = {
  readonly params: Readonly<Record<string, unknown>>;
};

const NetworkMapContent = (): ReactElement => <NetworkMap />;

const NetworkStationContent = ({ params }: RouteContentProps): ReactElement => (
  <NetworkStationPage address={readUriParam(params)} />
);

const NetworkLineContent = ({ params }: RouteContentProps): ReactElement => (
  <NetworkLinePage address={readUriParam(params)} />
);

/**
 * The network lens's routes:
 *
 * - `network`, at `/network`: the schematic map, which declares the lens
 *   (`routeLensFacet`), at tier 2 because its operations select the metro
 *   provider's routes, calls and diagram positions;
 * - `networkStation`, at `/network/stations/:uri`: one station's place on
 *   every route, or, for a station no route calls at, a page saying so;
 * - `networkLine`, at `/network/lines/:uri`: one line's strips.
 *
 * The address may be compact (the form the site's homes build) or absolute;
 * it expands through the graph's namespaces, as the entity lens's does.
 * Each route reaches the store through its `warm`.
 */
export const networkRoutes = {
  network: route({
    url: "/network",
    content: NetworkMapContent,
    warm: () => warmNetwork(),
    meta: routeLensFacet.of({
      label: NETWORK_LENS.label,
      icon: NetworkIcon,
      order: NETWORK_LENS.order,
      tier: 2,
    }),
  }),
  networkStation: route({
    url: "/network/stations/:uri",
    content: NetworkStationContent,
    warm: (params) => warmNetworkNode("stop", params),
  }),
  networkLine: route({
    url: "/network/lines/:uri",
    content: NetworkLineContent,
    warm: (params) => warmNetworkNode("line", params),
  }),
} as const;
