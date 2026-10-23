// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityChip,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/CodeStandardChip_node.graphql.js";
import type { CodeStandardChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardChip reads from the CodeStandard it renders: its
 * title and compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CodeStandardChip_node on CodeStandard {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds code-standard-chip";

/**
 * A code standard as an inline mention: its namespace prefix as the
 * chip's key before the separator (`cs:`), then its title, linked to its
 * home when the site has one and inert text when it has none. A
 * passage's own link text, given as `children`, stands in for the title;
 * a standard whose address did not compact has no key.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { CodeStandardChip } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_chip
 * @note Impure: reads its standard from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function CodeStandardChip({
  node,
  children,
  className,
  ...props
}: CodeStandardChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      lead={findCuriePrefix(curie)}
      LinkComponent={LinkComponent}
      value={children ?? title}
    />
  );
}
