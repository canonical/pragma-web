import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import carTypePageQueryNode from "#relay/__generated__/CarTypePageQuery.graphql.js";
import formationPageQueryNode from "#relay/__generated__/FormationPageQuery.graphql.js";
import stockPageQueryNode from "#relay/__generated__/StockPageQuery.graphql.js";
import unitPageQueryNode from "#relay/__generated__/UnitPageQuery.graphql.js";
import { TYPENAME_BY_KIND } from "../../../../constants.js";
import type { FleetNodeOperation } from "../../../../hooks/index.js";
import { useFleetNode } from "../../../../hooks/index.js";
import listFleetFacts, { type FleetPageNode } from "../../../listFleetFacts.js";
import type { FactListProps } from "./types.js";

/** Each page's operation, by the kind of node it shows. */
const QUERY_BY_KIND = {
  stock: stockPageQueryNode,
  formation: formationPageQueryNode,
  unit: unitPageQueryNode,
  carType: carTypePageQueryNode,
} as const;

/**
 * The node's facts as a definition list, each term and value grouped. It
 * reads the page's operation for the node, so it suspends until the store
 * holds it; an address naming a node of another type lists none.
 */
export default function FactList({
  kind,
  address,
}: FactListProps): ReactElement {
  const t = useMessages();
  const { node } = useFleetNode<
    FleetNodeOperation & { response: { node: FleetPageNode } }
  >({
    query: QUERY_BY_KIND[kind],
    address,
  });
  return (
    <dl className="facts">
      {(node !== null &&
      node !== undefined &&
      node.__typename === TYPENAME_BY_KIND[kind]
        ? listFleetFacts(node, t)
        : []
      ).map(({ term, value }) => (
        <div className="fact" key={term}>
          <dt className="term">{term}</dt>
          <dd className="value">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
