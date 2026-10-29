import { describe, expect, it } from "vitest";
import {
  SERIES_50_FOUR_CAR,
  SERIES_70_FIXED,
  SERIES_90_SIX_CAR,
  SERIES_90_THREE_CAR,
} from "../../../../testing/fixtures.js";
import {
  CAB_NOSE,
  CAR_HEIGHT,
  COUPLING_GAP,
  GANGWAY_GAP,
} from "../constants.js";
import buildTrainGeometry from "./buildTrainGeometry.js";
import orientCars from "./orientCars.js";

const SIX_CAR = orientCars(SERIES_90_SIX_CAR);
const THREE_CAR = orientCars(SERIES_90_THREE_CAR);

describe("buildTrainGeometry", () => {
  it("gives each car exactly its length, from the front at 0", () => {
    const { cars } = buildTrainGeometry(orientCars(SERIES_70_FIXED), 107200);
    expect(cars.map(({ start, end }) => [start, end])).toEqual([
      [0, 18400],
      [18400, 36000],
      [36000, 53600],
      [53600, 71200],
      [71200, 88800],
      [88800, 107200],
    ]);
  });

  it("ends the last car at exactly the train's length", () => {
    const geometry = buildTrainGeometry(SIX_CAR, 125000);
    expect(geometry.length).toBe(120000);
    expect(geometry.cars.at(-1)?.end).toBe(120000);
  });

  it("draws a car's width in proportion to its length", () => {
    const { cars } = buildTrainGeometry(orientCars(SERIES_70_FIXED), 107200);
    const [driving, motor] = cars;
    expect(driving && driving.end - driving.start).toBe(18400);
    expect(motor && motor.end - motor.start).toBe(17600);
  });

  it("couples the six-car's two units at 60 m", () => {
    expect(buildTrainGeometry(SIX_CAR, 120000).couplings).toEqual([60000]);
  });

  it("finds no coupling in a train of one unit", () => {
    expect(buildTrainGeometry(THREE_CAR, 60000).couplings).toEqual([]);
  });

  it("takes half a coupling gap from each unit where they meet", () => {
    const { cars } = buildTrainGeometry(SIX_CAR, 120000);
    const left = 40000 + GANGWAY_GAP / 2;
    const right = 60000 - COUPLING_GAP / 2;
    expect(cars.at(2)?.path).toBe(
      `M${left} 0H${right - CAB_NOSE}L${right} ${CAR_HEIGHT / 2}V${CAR_HEIGHT}H${left}Z`,
    );
    expect(cars.at(3)?.path).toMatch(
      new RegExp(`^M${60000 + COUPLING_GAP / 2} ${CAR_HEIGHT}V`),
    );
  });

  it("noses a front-facing cab car at its left end", () => {
    const { cars } = buildTrainGeometry(THREE_CAR, 60000);
    expect(cars.at(0)?.path).toBe(
      `M0 ${CAR_HEIGHT}V${CAR_HEIGHT / 2}L${CAB_NOSE} 0H${20000 - GANGWAY_GAP / 2}V${CAR_HEIGHT}Z`,
    );
  });

  it("noses a rear-facing cab car at its right end", () => {
    const { cars } = buildTrainGeometry(THREE_CAR, 60000);
    expect(cars.at(-1)?.path).toBe(
      `M${40000 + GANGWAY_GAP / 2} 0H${60000 - CAB_NOSE}L60000 ${CAR_HEIGHT / 2}V${CAR_HEIGHT}H${40000 + GANGWAY_GAP / 2}Z`,
    );
  });

  it("draws a car without a cab as a plain body", () => {
    const { cars } = buildTrainGeometry(THREE_CAR, 60000);
    expect(cars.at(1)?.path).toBe(
      `M${20000 + GANGWAY_GAP / 2} 0H${40000 - GANGWAY_GAP / 2}V${CAR_HEIGHT}H${20000 + GANGWAY_GAP / 2}Z`,
    );
  });

  it("noses only the two outer cars of a back-to-back pair", () => {
    const { cars } = buildTrainGeometry(orientCars(SERIES_50_FOUR_CAR), 62000);
    const noses = cars.map(({ path }) => path.includes("L"));
    expect(noses).toEqual([true, false, false, true]);
    expect(cars.at(-1)?.path).toContain(`L62000 ${CAR_HEIGHT / 2}`);
  });

  it("draws trains of one scale in drawing spaces of one width", () => {
    const short = buildTrainGeometry(THREE_CAR, 120000);
    const long = buildTrainGeometry(SIX_CAR, 120000);
    expect(short.width).toBe(long.width);
    expect(short.height).toBe(CAR_HEIGHT);
    expect(short.cars.at(-1)?.end).toBe(60000);
  });

  it("throws when the scale is shorter than the train", () => {
    expect(() => buildTrainGeometry(SIX_CAR, 100000)).toThrow(
      "a scale of 100000 cannot hold a train of 120000",
    );
  });

  it("lays out an empty train as an empty drawing", () => {
    expect(buildTrainGeometry([], 1000)).toEqual({
      width: 1000,
      height: CAR_HEIGHT,
      length: 0,
      cars: [],
      couplings: [],
    });
  });
});
