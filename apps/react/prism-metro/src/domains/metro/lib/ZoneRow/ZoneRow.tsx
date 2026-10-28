// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityRow, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/ZoneRow_node.graphql.js";
import type { ZoneRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ZoneRow reads from the Zone it renders: the stops inside it,
 * its name and its compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ZoneRow_node on Zone {
    __typename
    stops {
      uri
    }
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds zone-row";

/**
 * A fare zone as a 32px list entry: its name, and the count of the
 * stations inside it muted at the end. A fare zone has no home on this
 * site, so the name reads as inert text.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { ZoneRow } from "./lib/index.js";`
 *
 * @implements metro.component.zone_row
 * @note Impure: reads its zone from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function ZoneRow({
  node,
  className,
  ...props
}: ZoneRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data._meta.curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      meta={t("zone.stations.count", { count: data.stops.length })}
      title={data._meta.title}
    />
  );
}
