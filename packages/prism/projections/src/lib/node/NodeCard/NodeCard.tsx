import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import type { NodeCard_node$key } from "../../../__generated__/NodeCard_node.graphql.js";
import nodeCardFragmentNode from "../../../__generated__/NodeCard_node.graphql.js";
import type { CardArmProps } from "../../CardProjection/index.js";
import { useProjectionLink } from "../../projections/index.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What the card of any node reads: the fields every node carries. */
const nodeCardFragmentSource = (): unknown => graphql`
  fragment NodeCard_node on Node {
    _meta {
      title
      curie
      type {
        uri
      }
    }
  }
`;
void nodeCardFragmentSource;
/* v8 ignore stop */

const componentCssClassName = "ds node-card";

/**
 * The card of any node: its title as the card's heading, linked to its home
 * when it has one and inert text when it has none, then its compact address
 * as `.location`.
 *
 * The root carries the node's class IRI as `data-type`, for styling by
 * class; it is the arm's own and wins over the same attribute passed in.
 *
 * The link renders through the `LinkComponent` the nearest
 * `ProjectionsProvider` holds, so a site's router handles the navigation.
 *
 * Reachable as `defaultProjectionMaps.card.Node`.
 */
export default function NodeCard({
  node,
  href,
  className,
  ...props
}: CardArmProps): ReactElement {
  const data = useFragment<NodeCard_node$key>(nodeCardFragmentNode, node);
  const LinkComponent = useProjectionLink();
  return (
    <article
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data._meta.type.uri}
    >
      <h3 className="title">
        {href === undefined ? (
          data._meta.title
        ) : (
          <LinkComponent href={href}>{data._meta.title}</LinkComponent>
        )}
      </h3>
      <p className="location">
        <code>{data._meta.curie}</code>
      </p>
    </article>
  );
}
