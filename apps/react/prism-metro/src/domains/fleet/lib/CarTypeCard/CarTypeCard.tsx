// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCard, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/CarTypeCard_node.graphql.js";
import formatLength from "../formatLength.js";
import type { CarTypeCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields CarTypeCard reads from the CarType it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment CarTypeCard_node on CarType {
    __typename
    code
    hasCab
    length
    capacity
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

const componentCssClassName = "ds car-type-card";

/**
 * A car type as a card in a grid of entities: its name, linked to the car
 * type's page, its class and its definition; its code, its cab, its length
 * and its capacity as key values; and its length as the footer's vital.
 * The card has no sidecar: the car type's own page draws the car.
 *
 * Native props reach the root the EntityCard renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { CarTypeCard } from "./CarTypeCard/index.js";`
 *
 * @implements metro.component.car_type_card
 * @note Impure: reads its car type from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function CarTypeCard({
  node,
  className,
  ...props
}: CarTypeCardProps): ReactElement {
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
      LinkComponent={LinkComponent}
      keyValues={[
        {
          key: t("fleet.fact.code"),
          value: <code className="identifier">{data.code}</code>,
        },
        {
          key: t("fleet.fact.cab"),
          value: data.hasCab ? t("fleet.yes") : t("fleet.no"),
        },
        { key: t("fleet.fact.length"), value: formatLength(data.length) },
        {
          key: t("fleet.fact.capacity"),
          value: t("fleet.passengers.count", { count: data.capacity }),
        },
      ]}
      kind={type._meta.title}
      summary={definition ?? undefined}
      vitals={[formatLength(data.length)]}
      title={title}
    />
  );
}
