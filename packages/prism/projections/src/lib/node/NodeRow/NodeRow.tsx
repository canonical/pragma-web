// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/NodeRow_node.graphql.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityRow } from "../../ui/index.js";
import { NODE_MARK_ICON } from "../NodeChip/constants.js";
import type { NodeRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields NodeRow reads from the Node it renders, which every node
 * carries: its title, its compact address and its class's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment NodeRow_node on Node {
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

const componentCssClassName = "ds node-row";

/**
 * Any graph node as a 32px list entry, from what every node carries, in
 * the slot order: the generic node glyph as its mark, its namespace prefix when it differs from the page's ambient one
 * before its title, the title linked to its home when the site has one and
 * inert text when it has none, then its class's title as its kind. A node
 * whose address did not compact has no prefix.
 *
 * It is the row's `Node` arm: `RowProjection` renders it for every type no
 * other arm takes.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { NodeRow } from "@canonical/prism-projections";`
 *
 * @implements prism.component.node_row
 * @note Impure: reads its node from the Relay store, its home from the
 *   site's homes, its link from the projection provider and the page's
 *   ambient namespace.
 */
export default function NodeRow({
  node,
  className,
  ...props
}: NodeRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      mark={<Icon icon={NODE_MARK_ICON} />}
      prefix={prefix}
      title={title}
    />
  );
}
