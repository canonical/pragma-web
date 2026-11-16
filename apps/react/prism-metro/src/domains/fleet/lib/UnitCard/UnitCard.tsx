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
import nodeFragment from "#relay/__generated__/UnitCard_node.graphql.js";
import { FormationSideView } from "../FormationSideView/index.js";
import formatLength from "../formatLength.js";
import orientCars from "../orientCars.js";
import readUnitCars from "../readUnitCars.js";
import { UNIT_MARK_ICON } from "../UnitChip/constants.js";
import type { UnitCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields UnitCard reads from the Unit it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment UnitCard_node on Unit {
    __typename
    length
    capacity
    _meta {
      title
      curie
      definition
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
 * A unit as a card: its mark, its prefix off the page's namespace, its
 * name linked to its home, its definition, and its length, its capacity
 * and its cars as facts; its side view in a drawing specimen. It states no
 * address and no kind: the peek's line carries the address, and its mark
 * says the type.
 * Its mark is the unit's glyph, a published icon.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { UnitCard } from "#domains/fleet";`
 *
 * @implements metro.component.unit_card
 * @note Impure: reads its unit from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function UnitCard({
  node,
  className,
  ...props
}: UnitCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const cars = orientCars([{ reversed: false, cars: readUnitCars(data) }]);
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        {
          property: "length",
          label: t("fleet.fact.length"),
          value: formatLength(data.length),
        },
        {
          property: "capacity",
          label: t("fleet.fact.capacity"),
          value: t("fleet.passengers.count", { count: data.capacity }),
        },
        {
          property: "cars",
          label: t("fleet.fact.cars"),
          value: data.cars.length,
        },
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={UNIT_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    >
      <EntityCard.Specimen
        kind="drawing"
        label={t("fleet.unit.specimen", { title })}
      >
        <FormationSideView cars={cars} />
      </EntityCard.Specimen>
    </EntityCard>
  );
}
