import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import type { NodeChip_node$key } from "../../../__generated__/NodeChip_node.graphql.js";
import nodeChipFragmentNode from "../../../__generated__/NodeChip_node.graphql.js";
import type { EntityChipArmProps } from "../../EntityChip/index.js";
import useProjectionLink from "../../projections/hooks/useProjectionLink.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What the chip of any node reads: the fields every node carries. */
const nodeChipFragmentSource = (): unknown => graphql`
  fragment NodeChip_node on Node {
    _meta {
      title
      curie
      type {
        uri
      }
    }
  }
`;
void nodeChipFragmentSource;
/* v8 ignore stop */

const componentCssClassName = "ds node-chip";

/**
 * The chip of any node: its title, linked to its home when it has one and
 * inert text when it has none. The mention's text, when given, stands in
 * for the title.
 *
 * The root carries the node's class IRI as `data-type`, for styling by
 * class, and its compact address as `title`; both are the arm's own and
 * win over the same attributes passed in.
 *
 * The link renders through the `LinkComponent` the nearest
 * `ProjectionsProvider` holds, so a site's router handles the navigation.
 *
 * Reachable as `defaultProjectionMaps.chip.Node`.
 */
export default function NodeChip({
  node,
  href,
  children,
  className,
  ...props
}: EntityChipArmProps): ReactElement {
  const data = useFragment<NodeChip_node$key>(nodeChipFragmentNode, node);
  const LinkComponent = useProjectionLink();
  const label = children ?? data._meta.title;
  return (
    <span
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data._meta.type.uri}
      title={data._meta.curie}
    >
      {href === undefined ? (
        <span className="title">{label}</span>
      ) : (
        <LinkComponent className="title" href={href}>
          {label}
        </LinkComponent>
      )}
    </span>
  );
}
