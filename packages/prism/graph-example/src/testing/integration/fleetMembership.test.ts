// =============================================================================
// The fleet's computed fields, read through GraphQL and checked against what
// they are computed from: a unit's measures against its car types', a
// formation's against its units', and a formation's stock and lines against
// the stocks and lines that list it. A computed field that drifts from its
// source fails here, and so does a routed station without a platform length.
// =============================================================================

import { beforeAll, describe, expect, it } from "vitest";
import { assertPresent } from "../assertPresent.js";
import { BARE_STATION_URIS } from "../fixtures.js";
import { readFleet } from "../readFleet.js";
import type { Fleet, NetworkReference } from "../types.js";

let fleet: Fleet;

beforeAll(async () => {
  fleet = await readFleet();
});

/** The sorted IRIs of a list of references, for order-free comparison. */
const sortUris = (references: readonly NetworkReference[]): string[] =>
  references.map((reference) => reference.uri).sort();

/** The record with this IRI in a list, failing the test when it is absent. */
const findByUri = <T extends NetworkReference>(
  records: readonly T[],
  uri: string,
): T =>
  assertPresent(
    records.find((record) => record.uri === uri),
    `the fleet has no ${uri}`,
  );

describe("fleet membership", () => {
  it("has stocks, formations, units and car types to compare", () => {
    expect(fleet.stocks.length).toBeGreaterThan(0);
    expect(fleet.formations.length).toBeGreaterThan(0);
    expect(fleet.units.length).toBeGreaterThan(0);
    expect(fleet.carTypes.length).toBeGreaterThan(0);
  });

  it("measures each unit as the sum of its cars' car types", () => {
    for (const unit of fleet.units) {
      const carTypes = unit.cars.map((car) =>
        findByUri(fleet.carTypes, car.carType.uri),
      );
      expect(unit.length, unit.uri).toBe(
        carTypes.reduce((total, carType) => total + carType.length, 0),
      );
      expect(unit.capacity, unit.uri).toBe(
        carTypes.reduce((total, carType) => total + carType.capacity, 0),
      );
    }
  });

  it("measures each formation as the sum of its units", () => {
    for (const formation of fleet.formations) {
      const units = formation.units.map((placement) =>
        findByUri(fleet.units, placement.unit.uri),
      );
      expect(formation.length, formation.uri).toBe(
        units.reduce((total, unit) => total + unit.length, 0),
      );
      expect(formation.capacity, formation.uri).toBe(
        units.reduce((total, unit) => total + unit.capacity, 0),
      );
    }
  });

  it("names as each formation's stock the stock that lists it", () => {
    for (const formation of fleet.formations) {
      const stock = findByUri(fleet.stocks, formation.stock.uri);
      expect(sortUris(stock.formations), formation.uri).toContain(
        formation.uri,
      );
    }
  });

  it("runs each formation on exactly the lines whose formations list it", () => {
    for (const formation of fleet.formations) {
      const listing = fleet.lines
        .filter((line) =>
          line.formations.some((each) => each.uri === formation.uri),
        )
        .map((line) => line.uri)
        .sort();
      expect(sortUris(formation.lines), formation.uri).toEqual(listing);
    }
  });
});

describe("platform lengths", () => {
  it("measures a platform at every station a route calls at", () => {
    const calls = fleet.lines.flatMap((line) =>
      line.routes.flatMap((route) => route.calls),
    );
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call.stop.platformLength, call.stop.uri).toBeGreaterThan(0);
    }
  });

  it("measures none at the two stations no route calls at", () => {
    const bare = fleet.stations.filter((station) =>
      BARE_STATION_URIS.some((uri) => uri === station.uri),
    );
    expect(bare.map((station) => station.uri).sort()).toEqual(
      [...BARE_STATION_URIS].sort(),
    );
    for (const station of bare) {
      expect(station.platformLength, station.uri).toBeNull();
    }
  });
});
