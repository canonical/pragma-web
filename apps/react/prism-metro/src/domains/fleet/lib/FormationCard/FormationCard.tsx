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
import nodeFragment from "#relay/__generated__/FormationCard_node.graphql.js";
import { FORMATION_MARK_ICON } from "../FormationChip/constants.js";
import { FormationSideView } from "../FormationSideView/index.js";
import formatLength from "../formatLength.js";
import orientCars from "../orientCars.js";
import readFormationTrain from "../readFormationTrain.js";
import type { FormationCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields FormationCard reads from the Formation it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment FormationCard_node on Formation {
    __typename
    length
    capacity
    _meta {
      title
      curie
      definition
    }
    stock {
      _meta {
        title
      }
    }
    units {
      position
    }
    lines {
      _meta {
        title
      }
    }
    ...readFormationTrain_formation
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds formation-card";

/**
 * A formation as a card: its mark, its prefix off the page's namespace, its
 * name linked to its home, its definition, and its stock, its length, its
 * capacity, its units, its cars and the lines it runs on as facts, the
 * lines only when it runs on one; its side view in the specimen. It states
 * no address and no kind: the peek's line carries the address, and its mark
 * says the type.
 * Its mark is the formation's glyph, a published icon.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { FormationCard } from "#domains/fleet";`
 *
 * @implements metro.component.formation_card
 * @note Impure: reads its formation from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function FormationCard({
  node,
  className,
  ...props
}: FormationCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const cars = orientCars(readFormationTrain(data));
  const lines = data.lines.map((line) => line._meta.title);
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        {
          property: "stock",
          label: t("fleet.fact.stock"),
          value: data.stock._meta.title,
        },
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
          property: "units",
          label: t("fleet.fact.units"),
          value: data.units.length,
        },
        {
          property: "cars",
          label: t("fleet.fact.cars"),
          value: cars.length,
        },
        ...(lines.length === 0
          ? []
          : [
              {
                property: "lines",
                label: t("fleet.fact.lines"),
                value: lines.join(t("fleet.lines.separator")),
              },
            ]),
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={FORMATION_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    >
      <EntityCard.Specimen
        kind="drawing"
        label={t("fleet.formation.specimen", { title })}
      >
        <FormationSideView cars={cars} />
      </EntityCard.Specimen>
    </EntityCard>
  );
}
