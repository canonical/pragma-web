import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `MetroSearchQuery`, the search page's one
 * operation: one page of the provider's `search` extension, each result
 * through the site's chip switch beside its passage and the ranges of the
 * text in it, and the total. Nothing calls it: the route's warm and the
 * page read the compiled artifact, because an evaluated tag throws
 * wherever no Relay transform has run.
 */
const declareMetroSearchQuery = (): unknown => graphql`
  query MetroSearchQuery($text: String!, $first: Int) {
    search(text: $text, first: $first) {
      total
      edges {
        cursor
        node {
          ...MetroChipProjection_node
        }
        match {
          passage
          ranges {
            start
            length
          }
        }
      }
    }
  }
`;
void declareMetroSearchQuery;

/* v8 ignore stop */

export type {
  MetroSearchQuery,
  MetroSearchQuery$data,
  MetroSearchQuery$variables,
} from "#relay";
/** The compiled `MetroSearchQuery`. */
export { metroSearchQueryNode as searchQueryNode } from "#relay";
