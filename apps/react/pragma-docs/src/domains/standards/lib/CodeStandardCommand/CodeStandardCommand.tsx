// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/CodeStandardCommand_node.graphql.js";
import { CODE_STANDARD_MARK_ICON } from "../CodeStandardChip/constants.js";
import type { CodeStandardCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardCommand reads from the CodeStandard it renders: its
 * title, compact address and class, and the title of its first category.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CodeStandardCommand_node on CodeStandard {
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
    categories(first: 1) {
      edges {
        node {
          _meta {
            title
          }
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds code-standard-command";

/**
 * A code standard as a result in the command palette: the standard's mark, its
 * title, linked to its home when the site has one and inert text when it
 * has none, its compact address and its class on the second line, since
 * the palette's results mix every type, and its category as its status,
 * when it has one.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { CodeStandardCommand } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_command
 * @note Impure: reads its standard from the Relay store, its home from
 *   the site's homes and its link from the projection provider.
 */
export default function CodeStandardCommand({
  node,
  className,
  ...props
}: CodeStandardCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityCommand
      {...props}
      address={curie}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CODE_STANDARD_MARK_ICON} />}
      status={data.categories.edges.at(0)?.node._meta.title}
      title={title}
    />
  );
}
