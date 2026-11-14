// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/NodeChip_node.graphql.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityChip } from "../../ui/index.js";
import { useProjectionPeek } from "../ProjectionPeek/index.js";
import { NODE_MARK_ICON } from "./constants.js";
import type { NodeChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields NodeChip reads from the Node it renders, which every node
 * carries: its absolute IRI, the address its peek reads the node at, its
 * title and its compact address, the address its home is built from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment NodeChip_node on Node {
    __typename
    uri
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
 * Any graph node as an inline mention, from what every node carries: the
 * generic node glyph as its mark and its title in the chip's pill, linked
 * to its home when the site has one and inert text when it has none or
 * `linked` is false. A linked chip peeks at the node at its absolute IRI
 * through the site's peek, `useProjectionPeek` (the package's
 * `ProjectionPeek` when the site gives none), mounted when the peek opens. A passage's own link
 * text, given as `children`, stands in for the title.
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
 *   site's homes and its link and peek from the projection provider.
 */
export default function NodeChip({
  node,
  children,
  className,
  ...props
}: NodeChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const peek = useProjectionPeek(data.uri);
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={NODE_MARK_ICON} />}
      peek={peek}
      title={children ?? title}
    />
  );
}
