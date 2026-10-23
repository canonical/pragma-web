// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCard, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/InterchangeCard_node.graphql.js";
import buildStopKeyValues from "../../buildStopKeyValues.js";
import type { InterchangeCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields InterchangeCard reads from the Interchange it renders: its
 * platform count, its transfer time, its name, its compact address, its
 * definition, its class's title, its fare zone's title and the titles of
 * the lines that meet there.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment InterchangeCard_node on Interchange {
    __typename
    platformCount
    transferMinutes
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

const componentCssClassName = "ds interchange-card";

/**
 * An interchange as a card in a grid of entities: a station's card, its
 * fare zone above its name, the name linked to the interchange's page, its
 * class and its definition; its platforms, its zone, the lines that meet
 * there and its transfer time as key values; and its platform count and
 * the count of its lines as the footer's vitals. A value the graph does
 * not assert leaves its slot, its pair or its vital out.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { InterchangeCard } from "./lib/index.js";`
 *
 * @implements metro.component.interchange_card
 * @note Impure: reads its interchange from the Relay store, its home from
 *   the site's homes, its link from the projection provider and its words
 *   from the translator in scope.
 */
export default function InterchangeCard({
  node,
  className,
  ...props
}: InterchangeCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, definition, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const platforms = data.platformCount ?? undefined;
  const transfer = data.transferMinutes ?? undefined;
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      keyValues={[
        ...buildStopKeyValues(data, t),
        ...(transfer === undefined
          ? []
          : [
              {
                key: t("interchange.transfer"),
                value: t("interchange.transfer.minutes", { count: transfer }),
              },
            ]),
      ]}
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      location={data.inZone?._meta.title}
      summary={definition ?? undefined}
      title={title}
      vitals={[
        ...(platforms === undefined
          ? []
          : [t("station.platforms.count", { count: platforms })]),
        t("interchange.lines.count", { count: data.servesLine.length }),
      ]}
    />
  );
}
