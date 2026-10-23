import { Head } from "@canonical/react-head";
import { type ReactElement, useId } from "react";
import { formatMessage, MESSAGES } from "#i18n";
import type { StockPageQuery } from "#relay/__generated__/StockPageQuery.graphql.js";
import stockPageQueryNode from "#relay/__generated__/StockPageQuery.graphql.js";
import { useFleetNode } from "../../../../hooks/index.js";
import { FormationSideView } from "../../../FormationSideView/index.js";
import findScaleLength from "../../../findScaleLength.js";
import formatLength from "../../../formatLength.js";
import { NodeLink } from "../../../NodeLink/index.js";
import orientCars from "../../../orientCars.js";
import readFormationTrain from "../../../readFormationTrain.js";
import type { StockDetailProps } from "./types.js";

/**
 * A rolling stock's page, once its data is in the store: its title, its
 * formations at one scale, each linked to its page with its length, then
 * the car types its units are made of, each once, by code. An address
 * naming no rolling stock says nothing lives there.
 */
export default function StockDetail({
  address,
}: StockDetailProps): ReactElement {
  const formationsId = useId();
  const carTypesId = useId();
  const { node } = useFleetNode<StockPageQuery>({
    query: stockPageQueryNode,
    address,
  });
  if (node?.__typename !== "RollingStock") {
    const message = formatMessage("fleet.notFound", { address });
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
        <h2 id={formationsId}>{MESSAGES["fleet.formations"]}</h2>
        <ol className="list">
          {formations.map((formation) => (
            <li key={formation.uri}>
              <p className="entry" data-placeholder="entity-row">
                <NodeLink address={formation._meta.curie} typename="Formation">
                  {formation._meta.title}
                </NodeLink>
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
        <h2 id={carTypesId}>{MESSAGES["fleet.carTypes"]}</h2>
        <ul className="list">
          {carTypes.map((carType) => (
            <li
              className="entry"
              data-placeholder="entity-row"
              key={carType.uri}
            >
              <code className="code">{carType.code}</code>
              <NodeLink address={carType._meta.curie} typename="CarType">
                {carType._meta.title}
              </NodeLink>
              <span className="vital">{formatLength(carType.length)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
