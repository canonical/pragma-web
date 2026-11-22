import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `MetroSearchQuery`, the search page's one
 * operation: one page of the provider's `search` extension, each result
 * through the site's chip switch with its type, beside its passage and the
 * ranges of the text in it; the total, the type facets and whether a page
 * follows; from the second page, the types of the results before it; and,
 * from the third page, the cursor the previous page starts
 * after. Nothing calls it: the route's warm and the
 * page read the compiled artifact, because an evaluated tag throws
 * wherever no Relay transform has run.
 */
const declareMetroSearchQuery = (): unknown => graphql`
  query MetroSearchQuery(
    $text: String!
    $first: Int
    $after: String
    $types: [ID!]
    $hasEarlier: Boolean = false
    $earlierFirst: Int
    $hasPrevious: Boolean = false
    $previousFirst: Int
  ) {
    search(text: $text, first: $first, after: $after, types: $types) {
      total
      pageInfo {
        hasNextPage
        endCursor
      }
      facets {
        count
        type {
          uri
          label
          _meta {
            title
          }
        }
      }
      edges {
        cursor
        node {
          _meta {
            type {
              uri
            }
          }
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
    earlier: search(text: $text, first: $earlierFirst, types: $types)
      @include(if: $hasEarlier) {
      edges {
        node {
          _meta {
            type {
              uri
            }
          }
        }
      }
    }
    previous: search(text: $text, first: $previousFirst, types: $types)
      @include(if: $hasPrevious) {
      pageInfo {
        endCursor
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
