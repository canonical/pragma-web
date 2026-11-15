// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/NodeCommand_node.graphql.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityCommand } from "../../ui/index.js";
import { NODE_MARK_ICON } from "../NodeChip/constants.js";
import type { NodeCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields NodeCommand reads from the Node it renders, which every node
 * carries: its title, its compact address and its class's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment NodeCommand_node on Node {
    __typename
    _meta {
      title
      curie
      type {
        _meta {
          title
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds node-command";

/**
 * Any graph node as a 56px command-palette result, from what every node
 * carries, in the slot order: the generic node glyph as its mark, its
 * title on the first line, linked to its home when the site has one and
 * inert text when it has none, its full address on the second line,
 * which states its namespace, so it passes no prefix, and its class's
 * title as its kind, closing the first line. Any node has no status.
 *
 * It is the command's `Node` arm: `CommandProjection` renders it for every
 * type no other arm takes.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { NodeCommand } from "@canonical/prism-projections";`
 *
 * @implements prism.component.node_command
 * @note Impure: reads its node from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function NodeCommand({
  node,
  className,
  ...props
}: NodeCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityCommand
      {...props}
      address={curie}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      mark={<Icon icon={NODE_MARK_ICON} />}
      title={title}
    />
  );
}
