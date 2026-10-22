import { graphql, readInlineData } from "react-relay";
import type { readUnitCars_unit$key } from "#relay/__generated__/readUnitCars_unit.graphql.js";
import readUnitCarsFragmentNode from "#relay/__generated__/readUnitCars_unit.graphql.js";
import type { UnitCar } from "../types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What a side view reads of a unit: its cars, each with its car type. */
const declareUnitCarsFragment = (): unknown => graphql`
  fragment readUnitCars_unit on Unit @inline {
    cars {
      position
      reversed
      carType {
        code
        hasCab
        length
        _meta {
          title
        }
      }
    }
  }
`;
void declareUnitCarsFragment;
/* v8 ignore stop */

/**
 * Read a unit's cars for its side view, from the unit's front: the graph
 * numbers them from 1, and they are put in that order whatever order the
 * list arrives in.
 *
 * @param unit - The unit, as a key of `readUnitCars_unit`.
 * @returns The unit's cars, front first.
 */
export default function readUnitCars(
  unit: readUnitCars_unit$key,
): readonly UnitCar[] {
  const { cars } = readInlineData(readUnitCarsFragmentNode, unit);
  return [...cars]
    .sort((a, b) => a.position - b.position)
    .map(({ reversed, carType }) => ({
      code: carType.code,
      title: carType._meta.title,
      length: carType.length,
      hasCab: carType.hasCab,
      reversed,
    }));
}
