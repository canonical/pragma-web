// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCard, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/FormationCard_node.graphql.js";
import { FormationSideView } from "../FormationSideView/index.js";
import formatLength from "../formatLength.js";
import orientCars from "../orientCars.js";
import readFormationTrain from "../readFormationTrain.js";
import type { FormationCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields FormationCard reads from the Formation it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment FormationCard_node on Formation {
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
 * A formation as a card in a grid of entities: its stock above its name,
 * the name linked to the formation's page, then its class and its
 * definition; its length, its capacity, its units and the lines run with
 * it as key values; its car count as the footer's vital; and its side
 * view in the sidecar. A formation no line runs leaves the lines' pair
 * out.
 *
 * Native props reach the root the EntityCard renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { FormationCard } from "./FormationCard/index.js";`
 *
 * @implements metro.component.formation_card
 * @note Impure: reads its formation from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function FormationCard({
  node,
  className,
  ...props
}: FormationCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, definition, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const cars = orientCars(readFormationTrain(data));
  const lines = data.lines.map((line) => line._meta.title);
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
        { key: t("fleet.fact.units"), value: data.units.length },
        ...(lines.length === 0
          ? []
          : [
              {
                key: t("fleet.fact.lines"),
                value: lines.join(t("fleet.lines.separator")),
              },
            ]),
      ]}
      kind={type._meta.title}
      location={data.stock._meta.title}
      sidecar={<FormationSideView cars={cars} />}
      summary={definition ?? undefined}
      vitals={[t("fleet.cars.count", { count: cars.length })]}
      title={title}
    />
  );
}
