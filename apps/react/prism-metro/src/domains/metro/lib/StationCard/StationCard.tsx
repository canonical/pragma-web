// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCard,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/StationCard_node.graphql.js";
import buildStopFacts from "../../buildStopFacts.js";
import { STATION_MARK_ICON } from "../StationChip/constants.js";
import type { StationCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields StationCard reads from the Station it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment StationCard_node on Station {
    __typename
    location {
      latitude
      longitude
    }
    platformCount
    _meta {
      title
      curie
      definition
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
 * A station as a card: its mark, its prefix off the page's namespace,
 * its name linked to its home, its definition, and its platforms,
 * its fare zone and the lines it serves as facts, each only when the graph
 * asserts it. It states no address and no kind: the peek's
 * line carries the address, and its mark says the type.
 * Its mark is the station's glyph, a published icon.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { StationCard } from "#domains/metro";`
 *
 * @implements metro.component.station_card
 * @note Impure: reads its station from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function StationCard({
  node,
  className,
  ...props
}: StationCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const facts = buildStopFacts(data, t);
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={facts.length === 0 ? undefined : facts}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={STATION_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
