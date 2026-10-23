import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `MetroHomeQuery`, the landing's one
 * operation: the station and line classes' instance counts
 * (`instanceCount`, which counts every named instance, uncapped, where a
 * connection's edges stop at a page), and every ontology's classes, whose
 * total is the Definitions lens's own denominator. Nothing calls it: the
 * route's warm and the doors read the compiled artifact, because an
 * evaluated tag throws wherever no Relay transform has run.
 */
const declareMetroHomeQuery = (): unknown => graphql`
  query MetroHomeQuery($stationClass: String!, $lineClass: String!) {
    stations: ontologyClass(uri: $stationClass) {
      uri
      instanceCount
    }
    lines: ontologyClass(uri: $lineClass) {
      uri
      instanceCount
    }
    ontologies {
      prefix
      classes {
        uri
      }
    }
  }
`;
void declareMetroHomeQuery;

/* v8 ignore stop */

export type {
  MetroHomeQuery,
  MetroHomeQuery$data,
  MetroHomeQuery$variables,
} from "#relay/__generated__/MetroHomeQuery.graphql.js";
/** The compiled `MetroHomeQuery`. */
export { default as homeQueryNode } from "#relay/__generated__/MetroHomeQuery.graphql.js";
