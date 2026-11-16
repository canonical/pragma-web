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
import nodeFragment from "#relay/__generated__/ZoneCard_node.graphql.js";
import { ZONE_MARK_ICON } from "../ZoneChip/constants.js";
import type { ZoneCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ZoneCard reads from the Zone it renders: what its slots
 * show, and its compact address, which its home is resolved from.
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
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds zone-card";

/**
 * A fare zone as a card: its mark, its prefix off the page's namespace,
 * its name, linked to its home where the site gives it one, its
 * definition, and its count of stations as a fact. It states no address and no kind: the peek's
 * line carries the address, and its mark says the type.
 * Its mark is the zone's glyph, a published icon.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ZoneCard } from "#domains/metro";`
 *
 * @implements metro.component.zone_card
 * @note Impure: reads its zone from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function ZoneCard({
  node,
  className,
  ...props
}: ZoneCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        {
          property: "stops",
          label: t("zone.stations"),
          value: data.stops.length,
        },
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={ZONE_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
