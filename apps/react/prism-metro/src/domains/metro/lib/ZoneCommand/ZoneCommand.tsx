// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/ZoneCommand_node.graphql.js";
import { ZONE_MARK_ICON } from "../ZoneChip/constants.js";
import type { ZoneCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ZoneCommand reads from the Zone it renders: what its slots
 * show, and its compact address, which its home is resolved from.
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
 * A fare zone as a command-palette entry: its mark and its name, linked to
 * its home where the site gives it one, then its compact address, its kind and its count of
 * stations, its one figure, in the status. The address states its namespace, so it
 * shows no prefix.
 * Its mark is the zone's glyph, a published icon.
 *
 * Native props reach the entry's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ZoneCommand } from "#domains/metro";`
 *
 * @implements metro.component.zone_command
 * @note Impure: reads its zone from the Relay store, its home from the
 *   site's homes, and its link from the
 *   projection providers, and its words from the translator in scope.
 */
export default function ZoneCommand({
  node,
  className,
  ...props
}: ZoneCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityCommand
      {...props}
      address={curie}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      mark={<Icon icon={ZONE_MARK_ICON} />}
      status={t("zone.stations.count", { count: data.stops.length })}
      title={title}
    />
  );
}
