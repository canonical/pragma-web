import type { ConcreteRequest, RequestParameters } from "relay-runtime";

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

/** The operation's one selection: the root's `source(uri: $uri)`. */
const SOURCE_SELECTIONS = [
  {
    alias: null,
    args: [{ kind: "Variable", name: "uri", variableName: "uri" }],
    kind: "ScalarField",
    name: "source",
    storageKey: null,
  },
] as const;

/** The operation's one variable. */
const SOURCE_ARGUMENTS = [
  { defaultValue: null, kind: "LocalArgument", name: "uri" },
] as const;

/**
 * The same operation as a request node, written by hand in the shape the
 * Relay compiler emits, so a route's warm can fetch it into the store and
 * the renderer read it back from there: the server's render then carries
 * the document, and the store it serialises hands it to hydration.
 */
export const ENTITY_SOURCE_QUERY: ConcreteRequest = {
  fragment: {
    argumentDefinitions: SOURCE_ARGUMENTS,
    kind: "Fragment",
    metadata: null,
    name: "EntitySourceQuery",
    selections: SOURCE_SELECTIONS,
    type: "Query",
    abstractKey: null,
  },
  kind: "Request",
  operation: {
    argumentDefinitions: SOURCE_ARGUMENTS,
    kind: "Operation",
    name: "EntitySourceQuery",
    selections: SOURCE_SELECTIONS,
  },
  params: SOURCE_REQUEST,
};
