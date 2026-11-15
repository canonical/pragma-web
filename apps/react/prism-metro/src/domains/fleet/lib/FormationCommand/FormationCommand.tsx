// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/FormationCommand_node.graphql.js";
import { FORMATION_MARK_ICON } from "../FormationChip/constants.js";
import formatLength from "../formatLength.js";
import type { FormationCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields FormationCommand reads from the Formation it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment FormationCommand_node on Formation {
    __typename
    length
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

const componentCssClassName = "ds formation-command";

/**
 * A formation as a command-palette entry: its mark and its name, linked to
 * its home, then its compact address, its kind and its length, its one
 * figure, in the status. The address states its namespace, so it shows no
 * prefix.
 * Its mark is the formation's glyph, a published icon.
 *
 * Native props reach the entry's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { FormationCommand } from "#domains/fleet";`
 *
 * @implements metro.component.formation_command
 * @note Impure: reads its formation from the Relay store, its home from the
 *   site's homes, and its link from the projection providers, and its
 *   words from the translator in scope.
 */
export default function FormationCommand({
  node,
  className,
  ...props
}: FormationCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityCommand
      {...props}
      address={curie}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      mark={<Icon icon={FORMATION_MARK_ICON} />}
      status={formatLength(data.length)}
      title={title}
    />
  );
}
