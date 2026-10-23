// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCommand,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/ModifierCommand_node.graphql.js";
import type { ModifierCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierCommand reads from the Modifier it renders: its
 * title, compact address and class, and its family's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierCommand_node on Modifier {
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
    modifierFamily {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds modifier-command";

/**
 * A modifier as a 56px command-palette result: its title on the first
 * line, linked to its home when the site has one and inert text when it
 * has none; its class in its namespace's prefix on the second (`Modifier
 * in ds`); and its family at the end. A modifier whose address did not
 * compact names its class alone, and one with no family ends in no vital.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierCommand } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_command
 * @note Impure: reads its modifier from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function ModifierCommand({
  node,
  className,
  ...props
}: ModifierCommandProps): ReactElement {
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
      vital={data.modifierFamily?._meta.title}
    />
  );
}
