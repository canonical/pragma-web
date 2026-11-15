// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/RowProjection_node.graphql.js";
import { OntologyClassRow } from "../../ontology/index.js";
import useSiteSwitch from "../../projections/hooks/useSiteSwitch.js";
import { requireArmKey } from "../../utils/index.js";
import { NodeRow } from "../NodeRow/index.js";
import type { RowProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields RowProjection reads from the Node it dispatches: its typename, and
 * each arm's fragment, spread aliased by the type the arm projects, `Node` for
 * every type no other arm takes, and the site slot, which
 * the site's switch reads: `SiteRowSlot_node` spread aliased as `Site`.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment RowProjection_node on Node {
    __typename
    ...NodeRow_node @alias(as: "Node")
    ...SiteRowSlot_node @alias(as: "Site")
    ...OntologyClassRow_node @alias(as: "OntologyClass")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the 32px list entry, dispatched on its type by an explicit switch: an ontology class renders
 * through its own arm, `OntologyClassRow`, the cases being
 * `ONTOLOGY_TYPES`; any other type through the `Node` arm, `NodeRow`. A site that gives its switches to
 * `ProjectionLinkProvider` takes every node instead: it renders through the
 * site's row switch, over the site slot's key, the site's own compile of
 * `SiteRowSlot_node`.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`, and
 * every native prop reaches it.
 *
 * `import { RowProjection } from "@canonical/prism-projections";`
 *
 * @implements prism.component.row_projection
 * @note Impure: reads its node from the Relay store and the site's switch from
 *   the projection provider.
 */
export default function RowProjection({
  node,
  ...props
}: RowProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const Site = useSiteSwitch("row");
  if (Site !== undefined) return <Site {...props} node={data.Site} />;
  switch (data.__typename) {
    case "OntologyClass":
      return (
        <OntologyClassRow
          {...props}
          node={requireArmKey(data.OntologyClass, data.__typename)}
        />
      );
    default:
      return <NodeRow {...props} node={data.Node} />;
  }
}
