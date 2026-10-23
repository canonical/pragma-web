import { graphql } from "graphql";
import { createExampleProvider } from "../lib/provider/index.js";
import { readWholePage } from "./readWholePage.js";
import type {
  InstancePage,
  Network,
  NetworkLine,
  NetworkStation,
} from "./types.js";

/**
 * Every line and every station, in one query, as a client reads them. The
 * page size covers the whole dataset, and a page that reports more is a
 * failure rather than a silent truncation.
 */
const NETWORK_QUERY = `{
  lines: ontologyClass(uri: "metro:Line") {
    instances(first: 100) {
      edges { node { uri ... on Line {
        code colour servedBy { uri }
        routes { label isLoop reverse { label }
                 calls { position stop { uri diagramPosition { x y } } } }
      } } }
      pageInfo { hasNextPage }
    }
  }
  stations: ontologyClass(uri: "metro:Station") {
    instances(first: 100) {
      edges { node { __typename uri
        ... on Stop { servesLine { uri } diagramPosition { x y } } } }
      pageInfo { hasNextPage }
    }
  }
}`;

/**
 * Read the shipped network through the provider's GraphQL schema: every line
 * with its routes and calls, and every station with the lines it serves and
 * its place on the schematic diagram.
 *
 * Throws when the query reports an error or a list does not fit one page, so
 * a test built on it can never pass over a partial network.
 *
 * @note Impure: builds a provider, which reads the provider SDL from disk.
 */
export const readNetwork = async (): Promise<Network> => {
  const provider = createExampleProvider();
  const result = await graphql({
    schema: provider.schema,
    source: NETWORK_QUERY,
    rootValue: provider.rootValue,
  });
  if (result.errors !== undefined) {
    throw new Error(`readNetwork: ${result.errors.join("; ")}`);
  }
  const data = result.data as {
    readonly lines: InstancePage<NetworkLine>;
    readonly stations: InstancePage<NetworkStation>;
  };
  return {
    lines: readWholePage(data.lines, "readNetwork: the lines page"),
    stations: readWholePage(data.stations, "readNetwork: the stations page"),
  };
};
