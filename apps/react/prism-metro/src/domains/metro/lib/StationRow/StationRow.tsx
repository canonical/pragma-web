// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityRow, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/StationRow_node.graphql.js";
import type { StationRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields StationRow reads from the Station it renders: its platform
 * count, its name and its compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment StationRow_node on Station {
    __typename
    platformCount
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds station-row";

/**
 * A station as a 32px list entry: its name, linked to the station's page,
 * and its platform count muted at the end, left out when the graph asserts
 * none. The row has no namespace prefix: every station of an index shares
 * it.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { StationRow } from "./lib/index.js";`
 *
 * @implements metro.component.station_row
 * @note Impure: reads its station from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function StationRow({
  node,
  className,
  ...props
}: StationRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data._meta.curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const platforms = data.platformCount ?? undefined;
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      meta={
        platforms === undefined
          ? undefined
          : t("station.platforms.count", { count: platforms })
      }
      title={data._meta.title}
    />
  );
}
