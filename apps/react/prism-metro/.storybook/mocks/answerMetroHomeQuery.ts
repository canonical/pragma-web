import type { RelayParameters } from "@canonical/storybook-addon-relay";

/** The landing's one operation. */
const METRO_HOME_QUERY = "MetroHomeQuery";

/**
 * The metro graph's answer to the landing's query, as the example provider
 * gives it: the station, line and rolling-stock classes with their instance
 * counts, and every ontology's classes, sixteen between them.
 */
const METRO_HOME_ANSWER = {
  stations: { uri: "https://metro.example/onto#Station", instanceCount: 16 },
  lines: { uri: "https://metro.example/onto#Line", instanceCount: 3 },
  fleet: {
    uri: "https://metro.example/onto#RollingStock",
    instanceCount: 3,
  },
  ontologies: [
    {
      prefix: "metro",
      classes: [
        { uri: "https://metro.example/onto#Stop" },
        { uri: "https://metro.example/onto#Station" },
        { uri: "https://metro.example/onto#Interchange" },
        { uri: "https://metro.example/onto#Line" },
        { uri: "https://metro.example/onto#Route" },
        { uri: "https://metro.example/onto#Call" },
        { uri: "https://metro.example/onto#DiagramPoint" },
        { uri: "https://metro.example/onto#RollingStock" },
        { uri: "https://metro.example/onto#Formation" },
        { uri: "https://metro.example/onto#Unit" },
        { uri: "https://metro.example/onto#CarType" },
        { uri: "https://metro.example/onto#UnitPosition" },
        { uri: "https://metro.example/onto#CarPosition" },
      ],
    },
    {
      prefix: "geo",
      classes: [
        { uri: "https://geo.example/onto#GeoPoint" },
        { uri: "https://geo.example/onto#Zone" },
      ],
    },
    {
      prefix: "rdfs",
      classes: [{ uri: "http://www.w3.org/2000/01/rdf-schema#Class" }],
    },
  ],
};

/**
 * Build a story's `parameters.relay.generateFunction` that answers the
 * landing's query with the metro graph's own answer, so the doors show the
 * counts the site shows.
 *
 * @returns The payload builder. It throws on any other operation, so a story
 *   that issues one fails visibly instead of rendering a placeholder.
 *
 * @example
 * ```ts
 * parameters: { relay: { generateFunction: answerMetroHomeQuery() } }
 * ```
 */
export default function answerMetroHomeQuery(): NonNullable<
  RelayParameters["generateFunction"]
> {
  return (operation) => {
    const name = operation.request.node.params.name;
    if (name !== METRO_HOME_QUERY) {
      throw new Error(`The story answers ${METRO_HOME_QUERY}, not ${name}.`);
    }
    return { data: METRO_HOME_ANSWER };
  };
}
