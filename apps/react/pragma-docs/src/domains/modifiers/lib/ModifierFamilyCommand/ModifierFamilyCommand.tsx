// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/ModifierFamilyCommand_node.graphql.js";
import { MODIFIER_FAMILY_MARK_ICON } from "../ModifierFamilyChip/constants.js";
import type { ModifierFamilyCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierFamilyCommand reads from the ModifierFamily it
 * renders: its title, compact address and class, and the address of each
 * of its modifiers, which it counts.
 * Every member is read in one page of the schema's largest size, 100: a
 * family holds a handful of modifiers.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierFamilyCommand_node on ModifierFamily {
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

const componentCssClassName = "ds modifier-family-command";

/**
 * A modifier family as a result in the command palette: the family's
 * mark, its title, linked to its home when the site has one and inert
 * text when it has none, its compact address and its class on the second
 * line, since the palette's results mix every type, and the count of its
 * modifiers (`5 modifiers`) as its status.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierFamilyCommand } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_family_command
 * @note Impure: reads its family from the Relay store, its home from the
 *   site's homes, its words from the site's catalog and its link from the
 *   projection provider.
 */
export default function ModifierFamilyCommand({
  node,
  className,
  ...props
}: ModifierFamilyCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityCommand
      {...props}
      address={curie}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      mark={<Icon icon={MODIFIER_FAMILY_MARK_ICON} />}
      status={t("family.modifiers", { count: data.modifiers.edges.length })}
      title={title}
    />
  );
}
