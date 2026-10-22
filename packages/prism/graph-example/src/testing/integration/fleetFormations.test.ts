// =============================================================================
// The formation cases the fleet model has to carry, each read through GraphQL
// off the record that exhibits it:
//
//   - a fixed formation: one stock, one formation, one unit;
//   - one unit run alone or coupled to another;
//   - an asymmetric unit reversed in its formation;
//   - one stock in different lengths on different lines;
//   - a formation longer than a platform it calls at;
//   - a line run by two stocks.
//
// Orientation is data: a car's leading end faces the front of the train when
// its own `reversed` and its unit's are equal, and a cab sits at that end.
// =============================================================================

import { beforeAll, describe, expect, it } from "vitest";
import { assertPresent } from "../assertPresent.js";
import { findByUri } from "../findByUri.js";
import {
  ASYMMETRIC_UNIT_URI,
  COUPLED_FORMATION_URI,
  COUPLED_STOCK_URI,
  FIXED_FORMATION_STOCK_URI,
  MIXED_STOCK_LINE_URI,
  OVERLONG_FORMATION_URI,
  OVERLONG_LINE_URI,
  REVERSED_UNIT_FORMATION_URI,
  SHORT_PLATFORM_STATION_URI,
  SINGLE_UNIT_FORMATION_URI,
} from "../fixtures.js";
import { readFleet } from "../readFleet.js";
import type {
  Fleet,
  FleetCarType,
  FleetFormation,
  FleetLine,
  FleetStock,
  FleetUnit,
} from "../types.js";

let fleet: Fleet;

beforeAll(async () => {
  fleet = await readFleet();
});

/** A driving cab in a train: which car it is in, and which end it faces. */
interface CabEnd {
  /** The car's place in the train, counted from 1 at the front. */
  readonly car: number;
  readonly faces: "front" | "rear";
}

/** One car as it runs in a train: its car type and which way round it is. */
interface RunningCar {
  readonly carType: FleetCarType;
  /** True when the car's leading end faces the rear of the train. */
  readonly reversed: boolean;
}

/**
 * A formation's cars in train order. A reversed unit runs last car first,
 * and each of its cars runs the other way round from its place in the unit.
 */
const listRunningCars = (formation: FleetFormation): RunningCar[] =>
  formation.units.flatMap((placement) => {
    const unit = findByUri(fleet.units, placement.unit.uri);
    const cars = placement.reversed ? [...unit.cars].reverse() : unit.cars;
    return cars.map((car) => ({
      carType: findByUri(fleet.carTypes, car.carType.uri),
      reversed: car.reversed !== placement.reversed,
    }));
  });

/** Every driving cab in a formation, by car and by the end it faces. */
const listCabEnds = (formation: FleetFormation): CabEnd[] =>
  listRunningCars(formation).flatMap((running, index) =>
    running.carType.hasCab
      ? [{ car: index + 1, faces: running.reversed ? "rear" : "front" }]
      : [],
  );

/** The formations a line is run with. */
const listLineFormations = (line: FleetLine): FleetFormation[] =>
  line.formations.map((each) => findByUri(fleet.formations, each.uri));

/** The formations a stock lists, in its order. */
const listStockFormations = (stock: FleetStock): FleetFormation[] =>
  stock.formations.map((each) => findByUri(fleet.formations, each.uri));

/** The unit IRIs a formation runs, in order. */
const listUnitUris = (formation: FleetFormation): string[] =>
  formation.units.map((placement) => placement.unit.uri);

describe("a fixed formation", () => {
  it("is the stock's only formation, of one unit running forwards", () => {
    const [formation, ...others] = listStockFormations(
      findByUri(fleet.stocks, FIXED_FORMATION_STOCK_URI),
    );
    expect(others).toEqual([]);
    const { units } = assertPresent(formation, "the stock has no formation");
    expect(units.map((placement) => placement.reversed)).toEqual([false]);
  });
});

describe("a unit run alone or coupled", () => {
  it("runs the same unit once and twice", () => {
    const single = findByUri(fleet.formations, SINGLE_UNIT_FORMATION_URI);
    const coupled = findByUri(fleet.formations, COUPLED_FORMATION_URI);
    const unit = assertPresent(listUnitUris(single).at(0), "no unit");
    expect(listUnitUris(single)).toEqual([unit]);
    expect(listUnitUris(coupled)).toEqual([unit, unit]);
  });

  it("doubles the length and the capacity when coupled", () => {
    const single = findByUri(fleet.formations, SINGLE_UNIT_FORMATION_URI);
    const coupled = findByUri(fleet.formations, COUPLED_FORMATION_URI);
    expect(coupled.length).toBe(2 * single.length);
    expect(coupled.capacity).toBe(2 * single.capacity);
  });

  it("lists both as alternatives of one stock, shortest first", () => {
    const stock = findByUri(fleet.stocks, COUPLED_STOCK_URI);
    expect(stock.formations.map((each) => each.uri)).toEqual([
      SINGLE_UNIT_FORMATION_URI,
      COUPLED_FORMATION_URI,
    ]);
  });
});

describe("an asymmetric unit reversed in its formation", () => {
  const findAsymmetricUnit = (): FleetUnit =>
    findByUri(fleet.units, ASYMMETRIC_UNIT_URI);

  it("has a driving cab at one end only, its front", () => {
    const cabs = findAsymmetricUnit().cars.filter(
      (car) => findByUri(fleet.carTypes, car.carType.uri).hasCab,
    );
    expect(cabs.map((car) => [car.position, car.reversed])).toEqual([
      [1, false],
    ]);
  });

  it("runs once forwards and once reversed", () => {
    const formation = findByUri(fleet.formations, REVERSED_UNIT_FORMATION_URI);
    expect(
      formation.units.map((placement) => [
        placement.unit.uri,
        placement.reversed,
      ]),
    ).toEqual([
      [ASYMMETRIC_UNIT_URI, false],
      [ASYMMETRIC_UNIT_URI, true],
    ]);
  });

  it("puts a cab at each outer end of the train and none inside", () => {
    const formation = findByUri(fleet.formations, REVERSED_UNIT_FORMATION_URI);
    const cars = listRunningCars(formation).length;
    expect(listCabEnds(formation)).toEqual([
      { car: 1, faces: "front" },
      { car: cars, faces: "rear" },
    ]);
  });
});

describe("one stock in different lengths per line", () => {
  it("runs the stock's formations at more than one length across its lines", () => {
    const stock = findByUri(fleet.stocks, COUPLED_STOCK_URI);
    const ofStock = new Set(stock.formations.map((each) => each.uri));
    const lengthsByLine = fleet.lines.flatMap((line) =>
      listLineFormations(line)
        .filter((formation) => ofStock.has(formation.uri))
        .map((formation) => [line.uri, formation.length] as const),
    );
    expect(new Set(lengthsByLine.map(([line]) => line)).size).toBeGreaterThan(
      1,
    );
    expect(
      new Set(lengthsByLine.map(([, length]) => length)).size,
    ).toBeGreaterThan(1);
  });
});

/** The stops a line's routes call at whose platform is shorter than `length`. */
const listShortPlatforms = (line: FleetLine, length: number): string[] => [
  ...new Set(
    line.routes
      .flatMap((route) => route.calls)
      .filter(
        (call) =>
          assertPresent(
            call.stop.platformLength,
            `${call.stop.uri} has no platform length`,
          ) < length,
      )
      .map((call) => call.stop.uri),
  ),
];

describe("a formation longer than a platform", () => {
  it("overhangs exactly one platform, on one line", () => {
    const overhangs = fleet.lines.flatMap((line) =>
      listLineFormations(line).flatMap((formation) =>
        listShortPlatforms(line, formation.length).map((stop) => [
          formation.uri,
          line.uri,
          stop,
        ]),
      ),
    );
    expect(overhangs).toEqual([
      [OVERLONG_FORMATION_URI, OVERLONG_LINE_URI, SHORT_PLATFORM_STATION_URI],
    ]);
  });
});

describe("a line run by two stocks", () => {
  it("runs formations of two distinct stocks", () => {
    const line = findByUri(fleet.lines, MIXED_STOCK_LINE_URI);
    const stocks = listLineFormations(line).map(
      (formation) => formation.stock.uri,
    );
    expect(new Set(stocks).size).toBe(2);
  });
});
