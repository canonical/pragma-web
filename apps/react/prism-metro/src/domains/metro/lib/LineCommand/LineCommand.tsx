// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/LineCommand_node.graphql.js";
import type { LineCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineCommand reads from the Line it renders: the stops it
 * serves, its name, its compact address and its class's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineCommand_node on Line {
    __typename
    servedBy {
      uri
    }
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

const componentCssClassName = "ds line-command";

/**
 * A line as a 56px command-palette result: its name on the first line,
 * linked to the line's page, then its class alone, since a line has no
 * place of its own, and the count of the stops it serves at the end:
 * "North Line / Line · 5 stops".
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { LineCommand } from "./lib/index.js";`
 *
 * @implements metro.component.line_command
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function LineCommand({
  node,
  className,
  ...props
}: LineCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityCommand
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      title={title}
      vital={t("line.stops.count", { count: data.servedBy.length })}
    />
  );
}
