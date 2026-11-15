// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/StationCommand_node.graphql.js";
import { STATION_MARK_ICON } from "../StationChip/constants.js";
import type { StationCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields StationCommand reads from the Station it renders: what its slots
 * show, and its compact address, which its home is resolved from.
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
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds station-command";

/**
 * A station as a command-palette entry: its mark and its name, linked
 * to its home, then its compact address, its kind and its platform count,
 * its one figure, in the status. The address states its namespace, so it
 * shows no prefix.
 * Its mark is the station's glyph, a published icon.
 *
 * Native props reach the entry's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { StationCommand } from "#domains/metro";`
 *
 * @implements metro.component.station_command
 * @note Impure: reads its station from the Relay store, its home from the
 *   site's homes, and its link from the
 *   projection providers, and its words from the translator in scope.
 */
export default function StationCommand({
  node,
  className,
  ...props
}: StationCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const platforms = data.platformCount ?? undefined;
  return (
    <EntityCommand
      {...props}
      address={curie}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      mark={<Icon icon={STATION_MARK_ICON} />}
      status={
        platforms === undefined
          ? undefined
          : t("station.platforms.count", { count: platforms })
      }
      title={title}
    />
  );
}
