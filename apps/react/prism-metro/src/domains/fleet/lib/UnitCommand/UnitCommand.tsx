// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/UnitCommand_node.graphql.js";
import formatLength from "../formatLength.js";
import type { UnitCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields UnitCommand reads from the Unit it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment UnitCommand_node on Unit {
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

const componentCssClassName = "ds unit-command";

/**
 * A unit as a command-palette entry: its name and its class, and its
 * length as the entry's vital.
 *
 * Native props reach the root the EntityCommand renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { UnitCommand } from "./UnitCommand/index.js";`
 *
 * @implements metro.component.unit_command
 * @note Impure: reads its unit from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function UnitCommand({
  node,
  className,
  ...props
}: UnitCommandProps): ReactElement {
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
      vital={formatLength(data.length)}
      title={title}
    />
  );
}
