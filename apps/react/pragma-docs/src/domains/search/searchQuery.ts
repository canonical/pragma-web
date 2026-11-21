import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `DocsSearchQuery`, the search page's one
 * operation: one page of the provider's `search` extension, each result
 * through the site's chip switch beside its passage and the ranges of the
 * text in it, and the total. Nothing calls it: the route's warm and the
 * page read the compiled artifact, because an evaluated tag throws
 * wherever no Relay transform has run.
 */
const declareDocsSearchQuery = (): unknown => graphql`
  query DocsSearchQuery($text: String!, $first: Int) {
    search(text: $text, first: $first) {
      total
      edges {
        cursor
        node {
          ...DocsChipProjection_node
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
void declareDocsSearchQuery;

/* v8 ignore stop */

export type {
  DocsSearchQuery,
  DocsSearchQuery$data,
  DocsSearchQuery$variables,
} from "#relay/__generated__/DocsSearchQuery.graphql.js";
/** The compiled `DocsSearchQuery`. */
export { default as searchQueryNode } from "#relay/__generated__/DocsSearchQuery.graphql.js";
