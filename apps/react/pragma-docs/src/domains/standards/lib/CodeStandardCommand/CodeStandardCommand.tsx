// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCommand,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/CodeStandardCommand_node.graphql.js";
import type { CodeStandardCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardCommand reads from the CodeStandard it renders:
 * its title, compact address and class, and its first category's title.
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
 * A code standard as a 56px command-palette result: its title on the
 * first line, linked to its home when the site has one and inert text
 * when it has none; its class in its namespace's prefix on the second
 * (`Code Standard in cs`); and its first category at the end. A standard
 * whose address did not compact names its class alone, and one with no
 * category ends in no vital.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { CodeStandardCommand } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_command
 * @note Impure: reads its standard from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
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
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      location={findCuriePrefix(curie)}
      title={title}
      vital={data.categories.edges.at(0)?.node._meta.title}
    />
  );
}
