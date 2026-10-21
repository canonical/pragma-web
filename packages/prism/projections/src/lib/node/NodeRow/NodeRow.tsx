import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import type { NodeRow_node$key } from "../../../__generated__/NodeRow_node.graphql.js";
import nodeRowFragmentNode from "../../../__generated__/NodeRow_node.graphql.js";
import type { EntityRowArmProps } from "../../EntityRow/index.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What the row of any node reads: the fields every node carries. */
const nodeRowFragmentSource = (): unknown => graphql`
  fragment NodeRow_node on Node {
    _meta {
      title
      curie
      type {
        uri
      }
    }
  }
`;
void nodeRowFragmentSource;
/* v8 ignore stop */

const componentCssClassName = "ds node-row";

/**
 * The row of any node: its title, linked to its home when it has one and
 * inert text when it has none, then its compact address as `.location`.
 *
 * The root carries the node's class IRI as `data-type`, for styling by
 * class; it is the arm's own and wins over the same attribute passed in.
 *
 * Reachable as `defaultProjectionMaps.row.Node`.
 */
export default function NodeRow({
  node,
  href,
  className,
  ...props
}: EntityRowArmProps): ReactElement {
  const data = useFragment<NodeRow_node$key>(nodeRowFragmentNode, node);
  return (
    <li
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data._meta.type.uri}
    >
      {href === undefined ? (
        <span className="title">{data._meta.title}</span>
      ) : (
        <a className="title" href={href}>
          {data._meta.title}
        </a>
      )}{" "}
      <code className="location">{data._meta.curie}</code>
    </li>
  );
}
