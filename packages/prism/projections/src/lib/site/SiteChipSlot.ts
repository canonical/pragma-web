import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The site slot of `ChipProjection_node`, which spreads it aliased as `Site`:
 * the fields the site's chip switch reads. A site that gives its switches
 * to `ProjectionLinkProvider` compiles its own `SiteChipSlot_node` in place
 * of this one, spreading its own switch's fragment, and excludes this
 * module from its compile; this default reads the typename alone, for a
 * site that gives none.
 */
const declareSiteFragment = (): unknown => graphql`
  fragment SiteChipSlot_node on Node {
    __typename
  }
`;
void declareSiteFragment;
/* v8 ignore stop */
