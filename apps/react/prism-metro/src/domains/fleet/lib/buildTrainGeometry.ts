import {
  CAB_NOSE,
  CAR_HEIGHT,
  COUPLING_GAP,
  GANGWAY_GAP,
} from "../constants.js";
import type { CarDrawing, TrainCar, TrainGeometry } from "../types.js";

/** Where a car's nose goes: at its left end, its right end, or nowhere. */
type NoseSide = "left" | "right" | "none";

/**
 * Trace a car body between `left` and `right`, with a slanted nose at
 * `nose`: the end runs straight up to half the car's height, then slants
 * to the roof over `CAB_NOSE`.
 */
function traceBody(left: number, right: number, nose: NoseSide): string {
  const half = CAR_HEIGHT / 2;
  if (nose === "left") {
    return `M${left} ${CAR_HEIGHT}V${half}L${left + CAB_NOSE} 0H${right}V${CAR_HEIGHT}Z`;
  }
  if (nose === "right") {
    return `M${left} 0H${right - CAB_NOSE}L${right} ${half}V${CAR_HEIGHT}H${left}Z`;
  }
  return `M${left} 0H${right}V${CAR_HEIGHT}H${left}Z`;
}

/** Place a car's nose on the end its cab faces, or nowhere without a cab. */
function placeNose(car: TrainCar): NoseSide {
  if (!car.hasCab) return "none";
  return car.facing === "front" ? "left" : "right";
}

/** The gap drawn between two neighbouring cars, by whether they share a unit. */
function findGap(car: TrainCar, neighbour: TrainCar | undefined): number {
  if (neighbour === undefined) return 0;
  return neighbour.unitPosition === car.unitPosition
    ? GANGWAY_GAP
    : COUPLING_GAP;
}

/**
 * Lay a train's cars out for its side view, against a scale shared with
 * the other trains drawn beside it.
 *
 * The train's front is at the left, at 0, and each car takes exactly its
 * length, so the last car ends at the train's length and trains of one
 * scale compare directly. The gaps between cars are drawn inside their
 * lengths, half from each side: a coupling gap where two units meet, a
 * narrower gangway gap between the cars of one unit. A car with a cab gets
 * its nose on the end it faces: the left for a car facing the front, the
 * right for one facing the rear.
 *
 * @param cars - The train's cars, in train order and oriented.
 * @param scale - The width of the drawing's space, at least the train's
 *   length.
 * @returns The car outlines, the couplings and the drawing's space.
 * @throws When the scale is shorter than the train.
 */
export default function buildTrainGeometry(
  cars: readonly TrainCar[],
  scale: number,
): TrainGeometry {
  const length = cars.reduce((sum, car) => sum + car.length, 0);
  if (scale < length) {
    throw new Error(`a scale of ${scale} cannot hold a train of ${length}`);
  }
  const drawings: CarDrawing[] = [];
  let start = 0;
  for (const [index, car] of cars.entries()) {
    const end = start + car.length;
    const previous = index === 0 ? undefined : cars.at(index - 1);
    const before = findGap(car, previous);
    const after = findGap(car, cars.at(index + 1));
    drawings.push({
      ...car,
      start,
      end,
      path: traceBody(start + before / 2, end - after / 2, placeNose(car)),
    });
    start = end;
  }
  const couplings = drawings
    .filter((car, index) => {
      const next = drawings.at(index + 1);
      return next !== undefined && next.unitPosition !== car.unitPosition;
    })
    .map((car) => car.end);
  return {
    width: scale,
    height: CAR_HEIGHT,
    length,
    cars: drawings,
    couplings,
  };
}
