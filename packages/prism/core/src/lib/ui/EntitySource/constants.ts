import type { RequestParameters } from "relay-runtime";

/**
 * The one operation the Turtle renderer asks the provider: an entity's
 * statements as Turtle through the `source` extension, sent as full text
 * (no compiled artifact, no persisted id), since a site that leaves Turtle
 * out never registers it.
 */
export const SOURCE_REQUEST: RequestParameters = {
  cacheID: "EntitySourceQuery",
  id: null,
  metadata: {},
  name: "EntitySourceQuery",
  operationKind: "query",
  text: "query EntitySourceQuery($uri: ID!) { source(uri: $uri) }",
};
