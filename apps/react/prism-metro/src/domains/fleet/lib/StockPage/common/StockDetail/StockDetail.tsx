import { ChipProjection, RowProjection } from "@canonical/prism-projections";
import { Head } from "@canonical/react-head";
import { type ReactElement, useId } from "react";
import { useMessages } from "#i18n";
import type { StockPageQuery } from "#relay/__generated__/StockPageQuery.graphql.js";
import stockPageQueryNode from "#relay/__generated__/StockPageQuery.graphql.js";
import { useFleetNode } from "../../../../hooks/index.js";
import { FormationSideView } from "../../../FormationSideView/index.js";
import findScaleLength from "../../../findScaleLength.js";
import formatLength from "../../../formatLength.js";
import orientCars from "../../../orientCars.js";
import readFormationTrain from "../../../readFormationTrain.js";
import type { StockDetailProps } from "./types.js";

/**
 * A rolling stock's page, once its data is in the store: its title, its
 * formations at one scale, each named by its chip with its length, then
 * the car types its units are made of, each once, as its row. An address
 * naming no rolling stock says nothing lives there.
 */
export default function StockDetail({
  address,
}: StockDetailProps): ReactElement {
  const t = useMessages();
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
  const formations = node.formations.map((formation) => ({
    ...formation,
    cars: orientCars(readFormationTrain(formation)),
  }));
  const scale = findScaleLength(formations.map(({ length }) => length));
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
      <section aria-labelledby={formationsId} className="section">
        <h2 id={formationsId}>{t("fleet.formations")}</h2>
        <ol className="list">
          {formations.map((formation) => (
            <li key={formation.uri}>
              <p className="entry">
                <ChipProjection node={formation} />
                <span className="vital">{formatLength(formation.length)}</span>
              </p>
              <FormationSideView
                cars={formation.cars}
                className="side-view"
                scale={scale}
              />
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby={carTypesId} className="section">
        <h2 id={carTypesId}>{t("fleet.carTypes")}</h2>
        <ul className="rows">
          {carTypes.map((carType) => (
            <RowProjection key={carType.uri} node={carType} />
          ))}
        </ul>
      </section>
    </>
  );
}
