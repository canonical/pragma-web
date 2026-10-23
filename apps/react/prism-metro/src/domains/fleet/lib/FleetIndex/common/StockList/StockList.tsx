import type { ReactElement } from "react";
import { useLazyLoadQuery } from "react-relay";
import { MESSAGES } from "#i18n";
import type { FleetIndexQuery } from "#relay/__generated__/FleetIndexQuery.graphql.js";
import fleetIndexQueryNode from "#relay/__generated__/FleetIndexQuery.graphql.js";
import { FLEET_CLASS_URI, FLEET_PAGE_SIZE } from "../../../../constants.js";
import { FormationSideView } from "../../../FormationSideView/index.js";
import findScaleLength from "../../../findScaleLength.js";
import formatLength from "../../../formatLength.js";
import { NodeLink } from "../../../NodeLink/index.js";
import orientCars from "../../../orientCars.js";
import readFormationTrain from "../../../readFormationTrain.js";

/**
 * Every rolling stock the index's operation lists, each with its formations
 * at one scale, each formation linked to its page with its length. It
 * suspends until the store holds the operation.
 */
export default function StockList(): ReactElement {
  const { ontologyClass } = useLazyLoadQuery<FleetIndexQuery>(
    fleetIndexQueryNode,
    { classUri: FLEET_CLASS_URI, count: FLEET_PAGE_SIZE },
  );
  const stocks = (ontologyClass?.instances.edges ?? []).flatMap(({ node }) =>
    node.__typename === "RollingStock" ? [node] : [],
  );
  if (stocks.length === 0) {
    return <p className="status">{MESSAGES["fleet.index.empty"]}</p>;
  }
  return (
    <ul className="list" data-placeholder="entity-list">
      {stocks.map((stock) => {
        const scale = findScaleLength(
          stock.formations.map(({ length }) => length),
        );
        return (
          <li className="stock" data-placeholder="entity-card" key={stock.uri}>
            <h2>
              <NodeLink address={stock._meta.curie} typename="RollingStock">
                {stock._meta.title}
              </NodeLink>
            </h2>
            <div className="sidecar">
              {stock.formations.map((formation) => (
                <div key={formation.uri}>
                  <p className="entry">
                    <NodeLink
                      address={formation._meta.curie}
                      typename="Formation"
                    >
                      {formation._meta.title}
                    </NodeLink>
                    <span className="vital">
                      {formatLength(formation.length)}
                    </span>
                  </p>
                  <FormationSideView
                    cars={orientCars(readFormationTrain(formation))}
                    className="side-view"
                    scale={scale}
                  />
                </div>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
