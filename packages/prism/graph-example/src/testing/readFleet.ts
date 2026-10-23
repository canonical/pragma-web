import { graphql } from "graphql";
import { createExampleProvider } from "../lib/provider/index.js";
import { readWholePage } from "./readWholePage.js";
import type {
  Fleet,
  FleetCarType,
  FleetFormation,
  FleetLine,
  FleetStock,
  FleetStop,
  FleetUnit,
  InstancePage,
} from "./types.js";

/**
 * Every rolling stock, formation, unit and car type with every field the
 * schema serves on them, every line with its formations and the platforms
 * its routes call at, and every station's platform length, in one query.
 * The page size covers the whole dataset, and a page that reports more is a
 * failure rather than a silent truncation.
 */
const FLEET_QUERY = `{
  stocks: ontologyClass(uri: "metro:RollingStock") {
    instances(first: 100) {
      edges { node { uri ... on RollingStock { name formations { uri } } } }
      pageInfo { hasNextPage }
    }
  }
  formations: ontologyClass(uri: "metro:Formation") {
    instances(first: 100) {
      edges { node { uri ... on Formation {
        name length capacity stock { uri } lines { uri }
        units { position reversed unit { uri } }
      } } }
      pageInfo { hasNextPage }
    }
  }
  units: ontologyClass(uri: "metro:Unit") {
    instances(first: 100) {
      edges { node { uri ... on Unit {
        name length capacity
        cars { position reversed carType { uri } }
      } } }
      pageInfo { hasNextPage }
    }
  }
  carTypes: ontologyClass(uri: "metro:CarType") {
    instances(first: 100) {
      edges { node { uri ... on CarType {
        name code hasCab length capacity
      } } }
      pageInfo { hasNextPage }
    }
  }
  lines: ontologyClass(uri: "metro:Line") {
    instances(first: 100) {
      edges { node { uri ... on Line {
        formations { uri }
        routes { calls { stop { uri platformLength } } }
      } } }
      pageInfo { hasNextPage }
    }
  }
  stations: ontologyClass(uri: "metro:Station") {
    instances(first: 100) {
      edges { node { uri ... on Stop { platformLength } } }
      pageInfo { hasNextPage }
    }
  }
}`;

/**
 * Read the shipped fleet through the provider's GraphQL schema: every
 * rolling stock, formation, unit and car type, every line with the
 * formations it is run with and the stops its routes call at, and every
 * station with its platform length.
 *
 * Throws when the query reports an error or a list does not fit one page, so
 * a test built on it can never pass over a partial fleet.
 *
 * @note Impure: builds a provider, which reads the provider SDL from disk.
 */
export const readFleet = async (): Promise<Fleet> => {
  const provider = createExampleProvider();
  const result = await graphql({
    schema: provider.schema,
    source: FLEET_QUERY,
    rootValue: provider.rootValue,
  });
  if (result.errors !== undefined) {
    throw new Error(`readFleet: ${result.errors.join("; ")}`);
  }
  const data = result.data as {
    readonly stocks: InstancePage<FleetStock>;
    readonly formations: InstancePage<FleetFormation>;
    readonly units: InstancePage<FleetUnit>;
    readonly carTypes: InstancePage<FleetCarType>;
    readonly lines: InstancePage<FleetLine>;
    readonly stations: InstancePage<FleetStop>;
  };
  return {
    stocks: readWholePage(data.stocks, "readFleet: the stocks page"),
    formations: readWholePage(
      data.formations,
      "readFleet: the formations page",
    ),
    units: readWholePage(data.units, "readFleet: the units page"),
    carTypes: readWholePage(data.carTypes, "readFleet: the car types page"),
    lines: readWholePage(data.lines, "readFleet: the lines page"),
    stations: readWholePage(data.stations, "readFleet: the stations page"),
  };
};
