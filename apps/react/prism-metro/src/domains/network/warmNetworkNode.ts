import { getPrefetchEnvironment } from "@canonical/prism-core";
import { type CacheConfig, fetchQuery } from "relay-runtime";
import networkLineQueryNode from "../../relay/__generated__/NetworkLineQuery.graphql.js";
import networkMapQueryNode, {
  type NetworkMapQuery,
} from "../../relay/__generated__/NetworkMapQuery.graphql.js";
import networkStationQueryNode from "../../relay/__generated__/NetworkStationQuery.graphql.js";
import buildNetworkMapVariables from "./buildNetworkMapVariables.js";
import readAddressParam from "./lib/readAddressParam.js";
import readDiagramLines from "./lib/readDiagramLines.js";
import resolveNetworkAddress, {
  type NetworkNodeKind,
} from "./lib/resolveNetworkAddress.js";

/** Answer from the store when it holds the data, and fetch otherwise. */
const STORE_OR_NETWORK: CacheConfig & {
  readonly fetchPolicy: "store-or-network";
} = { fetchPolicy: "store-or-network" };

/** The operation that reads each kind of node's page. */
const NODE_QUERIES = {
  line: networkLineQueryNode,
  stop: networkStationQueryNode,
} as const;

/**
 * Warm the store for one line's or one station's page, in two steps: the map,
 * which every network page shows or resolves against, then the node's own
 * operation, whose `node(id:)` takes the IRI the map resolves the route's
 * address to. An address the network does not route stops after the map: the
 * page renders its not-found status from the map alone.
 *
 * Like the entity lens's warm, it reads the published environment once,
 * synchronously, and runs both steps against it with relay-runtime's
 * `fetchQuery` under the `store-or-network` policy, because the server
 * publishes the environment only while a route's `warm` runs synchronously.
 *
 * @param kind - Whether the route shows a line or a station.
 * @param params - The matched route params, carrying the percent-decoded
 *   address.
 * @returns A promise that settles when the store holds the page's data, at
 *   once when no environment is published, or rejects with the first fetch's
 *   error.
 * @throws When the params carry no address.
 * @note Impure: reads the module-level prefetch environment and performs up
 *   to two network requests through it.
 */
export default function warmNetworkNode(
  kind: NetworkNodeKind,
  params: Readonly<Record<string, unknown>>,
): Promise<void> {
  const address = readAddressParam(params);
  const environment = getPrefetchEnvironment();
  if (environment === undefined) return Promise.resolve();
  return fetchQuery<NetworkMapQuery>(
    environment,
    networkMapQueryNode,
    buildNetworkMapVariables(),
    STORE_OR_NETWORK,
  )
    .toPromise()
    .then((map) => {
      /* v8 ignore next -- the observable yields the response before it completes */
      const lines = map === undefined ? [] : readDiagramLines(map);
      const id = resolveNetworkAddress(address, lines, kind);
      if (id === undefined) return undefined;
      return fetchQuery(
        environment,
        NODE_QUERIES[kind],
        { id },
        STORE_OR_NETWORK,
      ).toPromise();
    })
    .then(() => undefined);
}
