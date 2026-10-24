// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityChip, useProjectionLink } from "@canonical/prism-projections";
import { Badge } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/ModifierFamilyChip_node.graphql.js";
import type { ModifierFamilyChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierFamilyChip reads from the ModifierFamily it renders:
 * its title and compact address, and the address of each of its
 * modifiers, which it counts.
 * Every member is read in one page of the schema's largest size, 100: a
 * family holds a handful of modifiers.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierFamilyChip_node on ModifierFamily {
    __typename
    _meta {
      title
      curie
    }
    modifiers(first: 100) {
      edges {
        node {
          uri
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds modifier-family-chip";

/**
 * A modifier family as an inline mention: its title in the chip's pill,
 * linked to its home when the site has one and inert text when it has
 * none, and the published Badge counting its modifiers beside it. A
 * passage's own link text, given as `children`, stands in for the title.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierFamilyChip } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_family_chip
 * @note Impure: reads its family from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function ModifierFamilyChip({
  node,
  children,
  className,
  ...props
}: ModifierFamilyChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityChip
      {...props}
      badge={<Badge value={data.modifiers.edges.length} />}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      value={children ?? title}
    />
  );
}
