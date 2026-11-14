import { useRenderers } from "@canonical/prism-core";
import { ChipProjection, RowProjection } from "@canonical/prism-projections";
import { Head } from "@canonical/react-head";
import { type ReactElement, useId } from "react";
import { useMessages } from "#i18n";
import type { StockPageQuery } from "#relay/__generated__/StockPageQuery.graphql.js";
import stockPageQueryNode from "#relay/__generated__/StockPageQuery.graphql.js";
import { FLEET_RENDERERS } from "../../../../constants.js";
import { useFleetNode } from "../../../../hooks/index.js";
import { FormationStack } from "../../../FormationStack/index.js";
import formatLength from "../../../formatLength.js";
import orientCars from "../../../orientCars.js";
import readFormationTrain from "../../../readFormationTrain.js";
import type { StockDetailProps } from "./types.js";

/**
 * A rolling stock's page, once its data is in the store: its title, its
 * formations drawn at one scale, each captioned by its chip and its
 * length, then the car types its units are made of, each once, as its
 * row. A stock with no formation says so, and lists no car types. An address
 * naming no rolling stock says nothing lives there.
 *
 * Under its title the page renders through the active page renderer:
 * these sections for the page, or the node's Turtle source for `as=turtle`.
 *
 * @note Impure: reads the Relay store, the translator and the address.
 */
export default function StockDetail({
  address,
}: StockDetailProps): ReactElement {
  const t = useMessages();
  const { active } = useRenderers("page", FLEET_RENDERERS.page);
  const formationsId = useId();
  const carTypesId = useId();
  const { node } = useFleetNode<StockPageQuery>({
    query: stockPageQueryNode,
    address,
  });
  if (node?.__typename !== "RollingStock") {
    const message = t("fleet.notFound", { address });
    return (
      <>
        <Head title={message} />
        <p className="not-found" role="status">
          {message}
        </p>
      </>
    );
  }
  const carTypes = [
    ...new Map(
      node.formations
        .flatMap(({ units }) => units)
        .flatMap(({ unit }) => unit.cars)
        .map(({ carType }) => [carType.uri, carType] as const),
    ).values(),
  ];
  return (
    <>
      <Head title={node._meta.title} />
      <h1 className="title">{node._meta.title}</h1>
      {active.render({
        uri: node.uri,
        title: node._meta.title,
        children: (
          <>
            <section aria-labelledby={formationsId} className="section">
              <h2 id={formationsId}>{t("fleet.formations")}</h2>
              {node.formations.length === 0 ? (
                <p className="empty">{t("fleet.formations.none")}</p>
              ) : (
                <FormationStack
                  className="formations"
                  trains={node.formations.map((formation) => ({
                    key: formation.uri,
                    cars: orientCars(readFormationTrain(formation)),
                    caption: (
                      <>
                        <ChipProjection node={formation} />
                        <span className="vital">
                          {formatLength(formation.length)}
                        </span>
                      </>
                    ),
                  }))}
                />
              )}
            </section>
            {carTypes.length === 0 ? null : (
              <section aria-labelledby={carTypesId} className="section">
                <h2 id={carTypesId}>{t("fleet.carTypes")}</h2>
                <ul className="rows">
                  {carTypes.map((carType) => (
                    <RowProjection key={carType.uri} node={carType} />
                  ))}
                </ul>
              </section>
            )}
          </>
        ),
      })}
    </>
  );
}
