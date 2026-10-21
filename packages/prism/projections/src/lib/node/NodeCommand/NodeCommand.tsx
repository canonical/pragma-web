import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import type { NodeCommand_node$key } from "../../../__generated__/NodeCommand_node.graphql.js";
import nodeCommandFragmentNode from "../../../__generated__/NodeCommand_node.graphql.js";
import type { EntityCommandArmProps } from "../../EntityCommand/index.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What the command of any node reads: the fields every node carries. */
const nodeCommandFragmentSource = (): unknown => graphql`
  fragment NodeCommand_node on Node {
    _meta {
      title
      curie
      type {
        uri
      }
    }
  }
`;
void nodeCommandFragmentSource;
/* v8 ignore stop */

const componentCssClassName = "ds node-command";

/**
 * The command-palette entry of any node: its title, linked to its home when
 * it has one and inert text when it has none, then its compact address as
 * `.location`.
 *
 * The root carries the node's class IRI as `data-type`, for styling by
 * class; it is the arm's own and wins over the same attribute passed in.
 *
 * Reachable as `defaultProjectionMaps.command.Node`.
 */
export default function NodeCommand({
  node,
  href,
  className,
  ...props
}: EntityCommandArmProps): ReactElement {
  const data = useFragment<NodeCommand_node$key>(nodeCommandFragmentNode, node);
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
      <span className="location">{data._meta.curie}</span>
    </li>
  );
}
