import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `MetroSearchDoorsQuery`, the empty search
 * page's one operation: for each lens that lists a single class, that
 * class's total from the provider's list extension, asked with no edges.
 * Nothing calls it: the route's warm and the page read the compiled
 * artifact, because an evaluated tag throws wherever no Relay transform
 * has run.
 */
const declareMetroSearchDoorsQuery = (): unknown => graphql`
  query MetroSearchDoorsQuery($stations: ID!, $lines: ID!, $fleet: ID!) {
    stations: facetedInstances(classUri: $stations, first: 0) {
      totalCount
    }
    lines: facetedInstances(classUri: $lines, first: 0) {
      totalCount
    }
    fleet: facetedInstances(classUri: $fleet, first: 0) {
      totalCount
    }
  }
`;
void declareMetroSearchDoorsQuery;

/* v8 ignore stop */

export type {
  MetroSearchDoorsQuery,
  MetroSearchDoorsQuery$data,
} from "#relay";
/** The compiled `MetroSearchDoorsQuery`. */
export { metroSearchDoorsQueryNode as searchDoorsQueryNode } from "#relay";
