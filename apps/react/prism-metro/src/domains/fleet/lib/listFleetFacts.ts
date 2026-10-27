import { LOCALE, type Translate } from "#i18n";
import type { CarTypePageQuery$data } from "#relay/__generated__/CarTypePageQuery.graphql.js";
import type { FormationPageQuery$data } from "#relay/__generated__/FormationPageQuery.graphql.js";
import type { StockPageQuery$data } from "#relay/__generated__/StockPageQuery.graphql.js";
import type { UnitPageQuery$data } from "#relay/__generated__/UnitPageQuery.graphql.js";
import type { FleetFact } from "../types.js";
import assertFragment from "./assertFragment.js";
import describeRange from "./describeRange.js";
import formatLength from "./formatLength.js";
import readFormationTrain from "./readFormationTrain.js";
import readUnitCars from "./readUnitCars.js";

/** The node a fleet page's operation answers with, of any of the four types. */
export type FleetPageNode =
  | StockPageQuery$data["node"]
  | FormationPageQuery$data["node"]
  | UnitPageQuery$data["node"]
  | CarTypePageQuery$data["node"];

/** Whole numbers, grouped as the app's locale groups them. */
const COUNT = new Intl.NumberFormat(LOCALE);

/** Read a capacity as a reader reads it: "960 passengers". */
function describeCapacity(capacity: number, t: Translate): string {
  return t("fleet.passengers.count", { count: capacity });
}

/**
 * List the facts a fleet page shows beside its node, by the node's type:
 *
 * - a rolling stock: how many formations it runs in, and the range of their
 *   lengths and capacities;
 * - a formation: its stock, its length, its capacity, and how many units
 *   and cars it has;
 * - a unit: its length, its capacity and how many cars it has;
 * - a car type: its code, whether it has a driving cab, its length and its
 *   capacity.
 *
 * A node of any other type has no facts.
 *
 * @param node - The node a fleet page's operation answered with.
 * @param t - The translator the facts' words are read through.
 * @returns The node's facts, in the order a reader reads them.
 */
export default function listFleetFacts(
  node: NonNullable<FleetPageNode>,
  t: Translate,
): readonly FleetFact[] {
  switch (node.__typename) {
    case "RollingStock":
      return [
        {
          term: t("fleet.fact.formations"),
          value: COUNT.format(node.formations.length),
        },
        {
          term: t("fleet.fact.length"),
          value: describeRange(
            node.formations.map(({ length }) => length),
            formatLength,
            t,
          ),
        },
        {
          term: t("fleet.fact.capacity"),
          value: describeRange(
            node.formations.map(({ capacity }) => capacity),
            (capacity) => describeCapacity(capacity, t),
            t,
          ),
        },
      ];
    case "Formation":
      return [
        { term: t("fleet.fact.stock"), value: node.stock._meta.title },
        {
          term: t("fleet.fact.length"),
          value: formatLength(node.length),
        },
        {
          term: t("fleet.fact.capacity"),
          value: describeCapacity(node.capacity, t),
        },
        {
          term: t("fleet.fact.units"),
          value: COUNT.format(node.units.length),
        },
        {
          term: t("fleet.fact.cars"),
          value: COUNT.format(
            readFormationTrain(
              assertFragment(
                node.readFormationTrain_formation,
                "readFormationTrain_formation",
              ),
            ).reduce((sum, unit) => sum + unit.cars.length, 0),
          ),
        },
      ];
    case "Unit":
      return [
        {
          term: t("fleet.fact.length"),
          value: formatLength(node.length),
        },
        {
          term: t("fleet.fact.capacity"),
          value: describeCapacity(node.capacity, t),
        },
        {
          term: t("fleet.fact.cars"),
          value: COUNT.format(
            readUnitCars(
              assertFragment(node.readUnitCars_unit, "readUnitCars_unit"),
            ).length,
          ),
        },
      ];
    case "CarType":
      return [
        { term: t("fleet.fact.code"), value: node.code },
        {
          term: t("fleet.fact.cab"),
          value: node.hasCab ? t("fleet.yes") : t("fleet.no"),
        },
        {
          term: t("fleet.fact.length"),
          value: formatLength(node.length),
        },
        {
          term: t("fleet.fact.capacity"),
          value: describeCapacity(node.capacity, t),
        },
      ];
    default:
      return [];
  }
}
