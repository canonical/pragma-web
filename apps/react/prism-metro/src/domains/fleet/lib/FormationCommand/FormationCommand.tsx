// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/FormationCommand_node.graphql.js";
import formatLength from "../formatLength.js";
import type { FormationCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields FormationCommand reads from the Formation it renders. */
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
    stock {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds formation-command";

/**
 * A formation as a command-palette entry: its name, its class and its
 * stock, and its length as the entry's vital.
 *
 * Native props reach the root the EntityCommand renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { FormationCommand } from "./FormationCommand/index.js";`
 *
 * @implements metro.component.formation_command
 * @note Impure: reads its formation from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function FormationCommand({
  node,
  className,
  ...props
}: FormationCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityCommand
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      kind={type._meta.title}
      location={data.stock._meta.title}
      vital={formatLength(data.length)}
      title={title}
    />
  );
}
