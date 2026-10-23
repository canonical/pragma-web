import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of `GraphNodeProjection_node`, which spreads it aliased as `Site`: the
 * fields the graph node map's site arms read, keyed by the node's typename. A
 * site that arms types of its own compiles its own `SiteGraphNodeProjection_node` in
 * place of this one, spreading each of its arms' fragments aliased by the
 * type the arm is on, and excludes this module from its compile; this
 * default reads the typename alone, for a site with no types of its own.
 */
const declareSiteFragment = (): unknown => graphql`
  fragment SiteGraphNodeProjection_node on Node {
    __typename
  }
`;
void declareSiteFragment;
/* v8 ignore stop */
