import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `DocsSearchDoorsQuery`, the empty search
 * page's one operation: for each lens that lists a single class, that
 * class's total from the provider's list extension, asked with no edges.
 * Nothing calls it: the route's warm and the page read the compiled
 * artifact, because an evaluated tag throws wherever no Relay transform
 * has run.
 */
const declareDocsSearchDoorsQuery = (): unknown => graphql`
  query DocsSearchDoorsQuery($components: ID!, $standards: ID!) {
    components: facetedInstances(classUri: $components, first: 0) {
      totalCount
    }
    standards: facetedInstances(classUri: $standards, first: 0) {
      totalCount
    }
  }
`;
void declareDocsSearchDoorsQuery;

/* v8 ignore stop */

export type {
  DocsSearchDoorsQuery,
  DocsSearchDoorsQuery$data,
} from "#relay/__generated__/DocsSearchDoorsQuery.graphql.js";
/** The compiled `DocsSearchDoorsQuery`. */
export { default as searchDoorsQueryNode } from "#relay/__generated__/DocsSearchDoorsQuery.graphql.js";
