// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCard, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/StationCard_node.graphql.js";
import buildStopKeyValues from "../../buildStopKeyValues.js";
import type { StationCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields StationCard reads from the Station it renders: its platform
 * count, its name, its compact address, its definition, its class's title,
 * its fare zone's title and the titles of the lines it serves.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment StationCard_node on Station {
    __typename
    platformCount
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
    inZone {
      _meta {
        title
      }
    }
    servesLine {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds station-card";

/**
 * A station as a card in a grid of entities: its fare zone above its name,
 * the name linked to the station's page, then its class and its
 * definition; its platforms, its zone and the lines it serves as key
 * values; and its platform count as the footer's vital. A value the graph
 * does not assert leaves its slot, its pair or its vital out.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { StationCard } from "./lib/index.js";`
 *
 * @implements metro.component.station_card
 * @note Impure: reads its station from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function StationCard({
  node,
  className,
  ...props
}: StationCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, definition, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const platforms = data.platformCount ?? undefined;
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      keyValues={buildStopKeyValues(data, t)}
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      location={data.inZone?._meta.title}
      summary={definition ?? undefined}
      title={title}
      vitals={
        platforms === undefined
          ? []
          : [t("station.platforms.count", { count: platforms })]
      }
    />
  );
}
