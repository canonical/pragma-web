// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/NodeChip_node.graphql.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityChip } from "../../ui/index.js";
import type { NodeChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields NodeChip reads from the Node it renders, which every node
 * carries: its title and its compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment NodeChip_node on Node {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds node-chip";

/**
 * Any graph node as an inline mention, from what every node carries: its
 * title alone in the chip's pill, linked to its home when the site has one
 * and inert text when it has none. A passage's own link text, given as
 * `children`, stands in for the title.
 *
 * It is the chip's `Node` arm: `ChipProjection` renders it for every type
 * no other arm takes.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { NodeChip } from "@canonical/prism-projections";`
 *
 * @implements prism.component.node_chip
 * @note Impure: reads its node from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function NodeChip({
  node,
  children,
  className,
  ...props
}: NodeChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data._meta.curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      value={children ?? data._meta.title}
    />
  );
}
