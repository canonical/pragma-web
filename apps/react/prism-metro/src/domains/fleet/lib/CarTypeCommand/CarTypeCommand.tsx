// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/CarTypeCommand_node.graphql.js";
import formatLength from "../formatLength.js";
import type { CarTypeCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields CarTypeCommand reads from the CarType it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment CarTypeCommand_node on CarType {
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

const componentCssClassName = "ds car-type-command";

/**
 * A car type as a command-palette entry: its name and its class, and its
 * length as the entry's vital.
 *
 * Native props reach the root the EntityCommand renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { CarTypeCommand } from "./CarTypeCommand/index.js";`
 *
 * @implements metro.component.car_type_command
 * @note Impure: reads its car type from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function CarTypeCommand({
  node,
  className,
  ...props
}: CarTypeCommandProps): ReactElement {
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
