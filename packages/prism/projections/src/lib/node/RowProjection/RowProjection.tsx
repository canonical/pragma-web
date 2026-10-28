// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/RowProjection_node.graphql.js";
import { useProjectionMaps } from "../../projections/index.js";
import renderArm from "../../projections/renderArm.js";
import type { RowProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields RowProjection reads from the Node it dispatches: its typename, and
 * each arm's fragment, spread aliased by the type the arm projects, `Node` for
 * every type no other arm takes, and the site slot, the arms of the site's own
 * types: `SiteRowSlot_node` spread aliased as `Site`.
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
 * Any graph node as the 32px list entry, dispatched on its type: it renders the
 * arm the site's row map holds for the node's typename, or the `Node` arm,
 * `NodeRow`, for every type no other arm takes. A site's arm for a type of its
 * own renders over the site slot's key, the site's own compile of
 * `SiteRowSlot_node`.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`, and
 * every native prop reaches it.
 *
 * `import { RowProjection } from "@canonical/prism-projections";`
 *
 * @implements prism.component.row_projection
 * @note Impure: reads its node from the Relay store and its arms from the
 *   projection provider.
 */
export default function RowProjection({
  node,
  ...props
}: RowProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  return renderArm(useProjectionMaps().row, data, props);
}
