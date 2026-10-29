import { graphql, readInlineData } from "react-relay";
import type { readFormationTrain_formation$key } from "#relay/__generated__/readFormationTrain_formation.graphql.js";
import readFormationTrainFragmentNode from "#relay/__generated__/readFormationTrain_formation.graphql.js";
import type { FormationUnit } from "../types.js";
import readUnitCars from "./readUnitCars.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What a side view reads of a formation: its units, each with its cars. */
const declareFormationTrainFragment = (): unknown => graphql`
  fragment readFormationTrain_formation on Formation @inline {
    units {
      position
      reversed
      unit {
        ...readUnitCars_unit
      }
    }
  }
`;
void declareFormationTrainFragment;
/* v8 ignore stop */

/**
 * Read a formation's units for its side view, from the formation's front,
 * in the order the graph numbers them, each with its cars.
 *
 * @param formation - The formation, as a key of
 *   `readFormationTrain_formation`.
 * @returns The formation's units, front first.
 */
export default function readFormationTrain(
  formation: readFormationTrain_formation$key,
): readonly FormationUnit[] {
  const { units } = readInlineData(readFormationTrainFragmentNode, formation);
  return [...units]
    .sort((a, b) => a.position - b.position)
    .map(({ reversed, unit }) => ({ reversed, cars: readUnitCars(unit) }));
}
