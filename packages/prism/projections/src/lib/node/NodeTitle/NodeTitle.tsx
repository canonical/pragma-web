import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import type { NodeTitle_node$key } from "../../../__generated__/NodeTitle_node.graphql.js";
import nodeTitleFragmentNode from "../../../__generated__/NodeTitle_node.graphql.js";
import type { EntityTitleArmProps } from "../../EntityTitle/index.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What the title of any node reads: the fields every node carries. */
const nodeTitleFragmentSource = (): unknown => graphql`
  fragment NodeTitle_node on Node {
    _meta {
      title
      curie
      type {
        uri
      }
    }
  }
`;
void nodeTitleFragmentSource;
/* v8 ignore stop */

const componentCssClassName = "ds node-title";

/**
 * The page title of any node: its title as the page's heading, then its
 * compact address as `.location`. It never links, even to the node's home:
 * a title names the page it heads.
 *
 * The root carries the node's class IRI as `data-type`, for styling by
 * class; it is the arm's own and wins over the same attribute passed in.
 *
 * Reachable as `defaultProjectionMaps.title.Node`.
 */
export default function NodeTitle({
  node,
  href: _href,
  className,
  ...props
}: EntityTitleArmProps): ReactElement {
  const data = useFragment<NodeTitle_node$key>(nodeTitleFragmentNode, node);
  return (
    <hgroup
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data._meta.type.uri}
    >
      <h1 className="title">{data._meta.title}</h1>
      <p className="location">
        <code>{data._meta.curie}</code>
      </p>
    </hgroup>
  );
}
