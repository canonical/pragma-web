// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCard, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/UnitCard_node.graphql.js";
import { FormationSideView } from "../FormationSideView/index.js";
import formatLength from "../formatLength.js";
import orientCars from "../orientCars.js";
import readUnitCars from "../readUnitCars.js";
import type { UnitCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields UnitCard reads from the Unit it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment UnitCard_node on Unit {
    __typename
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
    cars {
      position
    }
    ...readUnitCars_unit
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds unit-card";

/**
 * A unit as a card in a grid of entities: its name, linked to the unit's
 * page, its class and its definition; its length, its capacity and its car
 * count as key values; the car count as the footer's vital; and the unit
 * drawn as a train of its own in the sidecar.
 *
 * Native props reach the root the EntityCard renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { UnitCard } from "./UnitCard/index.js";`
 *
 * @implements metro.component.unit_card
 * @note Impure: reads its unit from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function UnitCard({
  node,
  className,
  ...props
}: UnitCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, definition, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const cars = orientCars([{ reversed: false, cars: readUnitCars(data) }]);
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      keyValues={[
        { key: t("fleet.fact.length"), value: formatLength(data.length) },
        {
          key: t("fleet.fact.capacity"),
          value: t("fleet.passengers.count", { count: data.capacity }),
        },
        { key: t("fleet.fact.cars"), value: data.cars.length },
      ]}
      kind={type._meta.title}
      sidecar={<FormationSideView cars={cars} />}
      summary={definition ?? undefined}
      vitals={[t("fleet.cars.count", { count: data.cars.length })]}
      title={title}
    />
  );
}
