// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityChip, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/ZoneChip_node.graphql.js";
import type { ZoneChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ZoneChip reads from the Zone it renders: its name and its
 * compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ZoneChip_node on Zone {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds zone-chip";

/**
 * A fare zone as an inline mention: its name alone in the chip's pill. A
 * fare zone has no home on this site, so the name reads as inert text. A
 * passage's own link text, given as `children`, stands in for the name.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { ZoneChip } from "./lib/index.js";`
 *
 * @implements metro.component.zone_chip
 * @note Impure: reads its zone from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function ZoneChip({
  node,
  children,
  className,
  ...props
}: ZoneChipProps): ReactElement {
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
