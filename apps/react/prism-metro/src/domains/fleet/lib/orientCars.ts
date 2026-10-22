import type { FormationUnit, TrainCar } from "../types.js";

/**
 * List a formation's cars in train order, each oriented in the train.
 *
 * A unit that runs reversed contributes its cars last first, and each of
 * them faces the other way from the way it faces in its unit: a car faces
 * the train's rear when exactly one of the car and its unit is reversed.
 * So two one-cab units coupled back to back, the second reversed, put a cab
 * at each end of the train and none in the middle.
 *
 * @param units - The formation's units, from its front.
 * @returns Every car, from the train's front.
 */
export default function orientCars(
  units: readonly FormationUnit[],
): readonly TrainCar[] {
  return units.flatMap((unit, index) => {
    const cars = unit.reversed ? [...unit.cars].reverse() : unit.cars;
    return cars.map(({ reversed, ...car }) => ({
      ...car,
      facing: reversed === unit.reversed ? "front" : "rear",
      unitPosition: index + 1,
    }));
  });
}
