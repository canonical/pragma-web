// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/ChipProjection_node.graphql.js";
import { useProjectionMaps } from "../../projections/index.js";
import renderArm from "../../projections/renderArm.js";
import type { ChipProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ChipProjection reads from the Node it dispatches: its typename,
 * and each arm's fragment, spread aliased by the type the arm projects, `Node`
 * for every type no other arm takes.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ChipProjection_node on Node {
    __typename
    ...NodeChip_node @alias(as: "Node")
    ...OntologyClassChip_node @alias(as: "OntologyClass")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the inline mention, dispatched on its type: it renders the
 * arm the site's chip map holds for the node's typename, or the `Node` arm,
 * `NodeChip`, for every type no other arm takes. A site's arm for a type of its
 * own renders over the `Node` arm's key.
 *
 * It renders no element of its own: the arm renders the root, a `<span>`, and
 * every native prop reaches it.
 *
 * `import { ChipProjection } from "@canonical/prism-projections";`
 *
 * @implements prism.component.chip_projection
 * @note Impure: reads its node from the Relay store and its arms from the
 *   projection provider.
 */
export default function ChipProjection({
  node,
  ...props
}: ChipProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  return renderArm(useProjectionMaps().chip, data, props);
}
