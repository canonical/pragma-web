// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/InterchangeCommand_node.graphql.js";
import type { InterchangeCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields InterchangeCommand reads from the Interchange it renders: its
 * name, its compact address, its class's title, its fare zone's title and
 * the lines that meet there.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment InterchangeCommand_node on Interchange {
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
    inZone {
      _meta {
        title
      }
    }
    servesLine {
      uri
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds interchange-command";

/**
 * An interchange as a 56px command-palette result: its name on the first
 * line, linked to the interchange's page, then "kind in location", its
 * class in its fare zone, and the count of the lines that meet there at
 * the end: "Central Exchange / Interchange in Central Zone · 3 lines". An
 * interchange in no zone names its class alone.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { InterchangeCommand } from "./lib/index.js";`
 *
 * @implements metro.component.interchange_command
 * @note Impure: reads its interchange from the Relay store, its home from
 *   the site's homes, its link from the projection provider and its words
 *   from the translator in scope.
 */
export default function InterchangeCommand({
  node,
  className,
  ...props
}: InterchangeCommandProps): ReactElement {
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
      location={data.inZone?._meta.title}
      title={title}
      vital={t("interchange.lines.count", { count: data.servesLine.length })}
    />
  );
}
