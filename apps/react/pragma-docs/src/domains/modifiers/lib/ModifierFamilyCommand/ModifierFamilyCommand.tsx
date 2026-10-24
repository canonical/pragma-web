// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCommand,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/ModifierFamilyCommand_node.graphql.js";
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
 * A modifier family as a 56px command-palette result: its title on the
 * first line, linked to its home when the site has one and inert text
 * when it has none; its class in its namespace's prefix on the second
 * (`Modifier family in ds`); and the count of its modifiers at the end.
 * A family whose address did not compact names its class alone.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierFamilyCommand } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_family_command
 * @note Impure: reads its family from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words
 *   from the translator in scope.
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
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      location={findCuriePrefix(curie)}
      title={title}
      vital={t("family.modifiers", { count: data.modifiers.edges.length })}
    />
  );
}
