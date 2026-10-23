// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityRow,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/CodeStandardRow_node.graphql.js";
import type { CodeStandardRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardRow reads from the CodeStandard it renders: its
 * title and compact address, and its first category's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CodeStandardRow_node on CodeStandard {
    __typename
    _meta {
      title
      curie
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

const componentCssClassName = "ds code-standard-row";

/**
 * A code standard as a 32px list entry: its namespace prefix, muted with
 * its colon (`cs:`), before its title, linked to its home when the site
 * has one and inert text when it has none; and its first category at the
 * end (`React`). A standard whose address did not compact has no prefix,
 * and one with no category ends in its title.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { CodeStandardRow } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_row
 * @note Impure: reads its standard from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function CodeStandardRow({
  node,
  className,
  ...props
}: CodeStandardRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = findCuriePrefix(curie);
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      location={
        prefix === undefined ? undefined : (
          <code className="identifier">
            {curie.slice(0, prefix.length + 1)}
          </code>
        )
      }
      meta={data.categories.edges.at(0)?.node._meta.title}
      title={title}
    />
  );
}
