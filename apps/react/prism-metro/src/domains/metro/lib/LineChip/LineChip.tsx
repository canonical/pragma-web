// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityChip, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/LineChip_node.graphql.js";
import type { LineChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineChip reads from the Line it renders: its name and its
 * compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineChip_node on Line {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds line-chip";

/**
 * A line as an inline mention: its name alone in the chip's pill,
 * linked to the line's page. A passage's own link text, given as
 * `children`, stands in for the name.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { LineChip } from "./lib/index.js";`
 *
 * @implements metro.component.line_chip
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function LineChip({
  node,
  children,
  className,
  ...props
}: LineChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data._meta.curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      value={children ?? data._meta.title}
    />
  );
}
