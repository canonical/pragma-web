// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityChip,
  useForeignPrefix,
  useProjectionLink,
  useProjectionPeek,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/ZoneChip_node.graphql.js";
import { ZONE_MARK_ICON } from "./constants.js";
import type { ZoneChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ZoneChip reads from the Zone it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ZoneChip_node on Zone {
    __typename
    uri
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
 * A fare zone as an inline mention: its mark, its prefix when the zone
 * is off the page's namespace, and its name, linked to its home where the
 * site gives it one (a fare zone has none on this site, so it reads as
 * text, with no peek); a linked
 * chip peeks at the zone's card, the peek the site's provider gives. A
 * passage's own link text, given as `children`, stands in for the name;
 * `linked={false}` sets the chip as inert text.
 * Its mark is the zone's glyph, a published icon.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ZoneChip } from "#domains/metro";`
 *
 * @implements metro.component.zone_chip
 * @note Impure: reads its zone from the Relay store, its home from the
 *   site's homes, and its link, its peek and the page's namespace from the
 *   projection providers.
 */
export default function ZoneChip({
  node,
  children,
  className,
  ...props
}: ZoneChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const peek = useProjectionPeek(data.uri);
  const prefix = useForeignPrefix(curie);
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={ZONE_MARK_ICON} />}
      peek={peek}
      prefix={prefix}
      title={children ?? title}
    />
  );
}
