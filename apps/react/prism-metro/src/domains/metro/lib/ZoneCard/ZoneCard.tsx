// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCard, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/ZoneCard_node.graphql.js";
import type { ZoneCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ZoneCard reads from the Zone it renders: the stops inside it,
 * its name, its compact address, its definition and its class's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ZoneCard_node on Zone {
    __typename
    stops {
      uri
    }
    _meta {
      title
      curie
      definition
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

const componentCssClassName = "ds zone-card";

/**
 * A fare zone as a card in a grid of entities: its name, its class and its
 * definition, and the count of the stations inside it as the footer's
 * vital. A fare zone has no home on this site, so the name reads as inert
 * text.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { ZoneCard } from "./lib/index.js";`
 *
 * @implements metro.component.zone_card
 * @note Impure: reads its zone from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function ZoneCard({
  node,
  className,
  ...props
}: ZoneCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, definition, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      summary={definition ?? undefined}
      title={title}
      vitals={[t("zone.stations.count", { count: data.stops.length })]}
    />
  );
}
