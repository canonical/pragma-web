// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/StationCommand_node.graphql.js";
import type { StationCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields StationCommand reads from the Station it renders: its platform
 * count, its name, its compact address, its class's title and its fare
 * zone's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment StationCommand_node on Station {
    __typename
    platformCount
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
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds station-command";

/**
 * A station as a 56px command-palette result: its name on the first line,
 * linked to the station's page, then "kind in location", its class in its
 * fare zone, and its platform count at the end: "Northgate / Station in
 * Central Zone · 4 platforms". A station in no zone names its class alone,
 * and one with no platform count has no vital.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { StationCommand } from "./lib/index.js";`
 *
 * @implements metro.component.station_command
 * @note Impure: reads its station from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function StationCommand({
  node,
  className,
  ...props
}: StationCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const platforms = data.platformCount ?? undefined;
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
      vital={
        platforms === undefined
          ? undefined
          : t("station.platforms.count", { count: platforms })
      }
    />
  );
}
