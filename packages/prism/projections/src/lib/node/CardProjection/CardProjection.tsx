// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/CardProjection_node.graphql.js";
import { OntologyClassCard } from "../../ontology/index.js";
import useSiteSwitch from "../../projections/hooks/useSiteSwitch.js";
import { requireArmKey } from "../../utils/index.js";
import { NodeCard } from "../NodeCard/index.js";
import type { CardProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CardProjection reads from the Node it dispatches: its typename,
 * and each arm's fragment, spread aliased by the type the arm projects, `Node`
 * for every type no other arm takes, and the site slot, which
 * the site's switch reads: `SiteCardSlot_node` spread aliased as `Site`.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CardProjection_node on Node {
    __typename
    ...NodeCard_node @alias(as: "Node")
    ...SiteCardSlot_node @alias(as: "Site")
    ...OntologyClassCard_node @alias(as: "OntologyClass")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the card in a grid of entities, dispatched on its type by an explicit switch: an ontology class renders
 * through its own arm, `OntologyClassCard`, the cases being
 * `ONTOLOGY_TYPES`; any other type through the `Node` arm, `NodeCard`. A site that gives its switches to
 * `ProjectionLinkProvider` takes every node instead: it renders through the
 * site's card switch, over the site slot's key, the site's own compile of
 * `SiteCardSlot_node`.
 *
 * It renders no element of its own: the arm renders the root, a `<div>`, and
 * every native prop reaches it.
 *
 * `import { CardProjection } from "@canonical/prism-projections";`
 *
 * @implements prism.component.card_projection
 * @note Impure: reads its node from the Relay store and the site's switch from
 *   the projection provider.
 */
export default function CardProjection({
  node,
  ...props
}: CardProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const Site = useSiteSwitch("card");
  if (Site !== undefined) return <Site {...props} node={data.Site} />;
  switch (data.__typename) {
    case "OntologyClass":
      return (
        <OntologyClassCard
          {...props}
          node={requireArmKey(data.OntologyClass, data.__typename)}
        />
      );
    default:
      return <NodeCard {...props} node={data.Node} />;
  }
}
