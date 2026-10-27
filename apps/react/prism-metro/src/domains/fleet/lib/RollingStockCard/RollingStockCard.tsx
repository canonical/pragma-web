// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCard, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/RollingStockCard_node.graphql.js";
import describeFormations from "../describeFormations.js";
import { FormationStack } from "../FormationStack/index.js";
import orientCars from "../orientCars.js";
import readFormationTrain from "../readFormationTrain.js";
import type { RollingStockCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields RollingStockCard reads from the RollingStock it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment RollingStockCard_node on RollingStock {
    __typename
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
    formations {
      uri
      length
      capacity
      _meta {
        title
      }
      ...readFormationTrain_formation
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds rolling-stock-card";

/**
 * A rolling stock as a card in a grid of entities: its name, linked to
 * the stock's page, its class and its definition; how many formations it
 * runs in and the range of their lengths and capacities as key values;
 * that count as the footer's vital; and its formations drawn at one scale
 * in the sidecar, each named by its title. A stock with no formation
 * shows its count alone, and no sidecar.
 *
 * Native props reach the root the EntityCard renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { RollingStockCard } from "./RollingStockCard/index.js";`
 *
 * @implements metro.component.rolling_stock_card
 * @note Impure: reads its rolling stock from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function RollingStockCard({
  node,
  className,
  ...props
}: RollingStockCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, definition, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const count = data.formations.length;
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      keyValues={describeFormations(data.formations, t).map(
        ({ term, value }) => ({ key: term, value }),
      )}
      kind={type._meta.title}
      sidecar={
        count === 0 ? undefined : (
          <FormationStack
            trains={data.formations.map((formation) => ({
              key: formation.uri,
              cars: orientCars(readFormationTrain(formation)),
              caption: formation._meta.title,
            }))}
          />
        )
      }
      summary={definition ?? undefined}
      vitals={[t("fleet.formations.count", { count })]}
      title={title}
    />
  );
}
