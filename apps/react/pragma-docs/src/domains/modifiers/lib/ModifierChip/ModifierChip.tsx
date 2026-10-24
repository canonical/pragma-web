// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityChip, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/ModifierChip_node.graphql.js";
import type { ModifierChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierChip reads from the Modifier it renders: its title,
 * compact address and class.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierChip_node on Modifier {
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

const componentCssClassName = "ds modifier-chip";

/**
 * A modifier as an inline mention: its class as the chip's key before
 * the separator, then its title (`Modifier: Danger`), linked to its home
 * when the site has one and inert text when it has none. A passage's own
 * link text, given as `children`, stands in for the title.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierChip } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_chip
 * @note Impure: reads its modifier from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function ModifierChip({
  node,
  children,
  className,
  ...props
}: ModifierChipProps): ReactElement {
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
      lead={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      value={children ?? title}
    />
  );
}
