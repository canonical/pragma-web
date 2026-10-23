// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/ZoneCommand_node.graphql.js";
import type { ZoneCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ZoneCommand reads from the Zone it renders: the stops inside
 * it, its name, its compact address and its class's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ZoneCommand_node on Zone {
    __typename
    stops {
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

const componentCssClassName = "ds zone-command";

/**
 * A fare zone as a 56px command-palette result: its name on the first
 * line, then its class alone, and the count of the stations inside it at
 * the end: "Central Zone / Fare zone · 2 stations". A fare zone has no home
 * on this site, so the name reads as inert text.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { ZoneCommand } from "./lib/index.js";`
 *
 * @implements metro.component.zone_command
 * @note Impure: reads its zone from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function ZoneCommand({
  node,
  className,
  ...props
}: ZoneCommandProps): ReactElement {
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
      vital={t("zone.stations.count", { count: data.stops.length })}
    />
  );
}
