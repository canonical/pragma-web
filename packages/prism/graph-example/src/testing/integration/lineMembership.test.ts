// =============================================================================
// `Stop.servesLine` and `Line.servedBy` are stated in the dataset, and the
// routes' calls state the same membership a second time. This file derives
// each from the other through GraphQL and requires them to agree, so a call
// added without its `servesLine`, or the reverse, fails here.
// =============================================================================

import { beforeAll, describe, expect, it } from "vitest";
import { readNetwork } from "../readNetwork.js";
import type { Network, NetworkLine, NetworkReference } from "../types.js";

let network: Network;

beforeAll(async () => {
  network = await readNetwork();
});

/** The sorted IRIs of a list of references, for order-free comparison. */
const sortUris = (references: readonly NetworkReference[]): string[] =>
  references.map((reference) => reference.uri).sort();

/** Every stop any route of the line calls at, sorted and without repeats. */
const collectCalledStops = (line: NetworkLine): string[] =>
  [
    ...new Set(
      line.routes.flatMap((route) => route.calls.map((call) => call.stop.uri)),
    ),
  ].sort();

describe("line membership", () => {
  it("has lines and stations to compare", () => {
    expect(network.lines.length).toBeGreaterThan(0);
    expect(network.stations.length).toBeGreaterThan(0);
  });

  it("serves each line by exactly the stops its routes call at", () => {
    for (const line of network.lines) {
      expect(collectCalledStops(line), line.uri).toEqual(
        sortUris(line.servedBy),
      );
    }
  });

  it("has each station serve exactly the lines whose routes call there", () => {
    for (const station of network.stations) {
      const calling = network.lines
        .filter((line) => collectCalledStops(line).includes(station.uri))
        .map((line) => line.uri)
        .sort();
      expect(sortUris(station.servesLine), station.uri).toEqual(calling);
    }
  });

  it("serves two or more lines at every interchange", () => {
    const interchanges = network.stations.filter(
      (station) => station.__typename === "Interchange",
    );
    expect(interchanges.length).toBeGreaterThan(0);
    for (const interchange of interchanges) {
      expect(
        interchange.servesLine.length,
        interchange.uri,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("shares a plain station only between lines over the same stops", () => {
    // Where lines serving different stops meet, passengers change, and that
    // makes the station an interchange. Lines over the same stops (a ring run
    // in opposite directions by two lines) meet at every station without
    // making any of them one.
    const shared = network.stations.filter(
      (station) =>
        station.__typename === "Station" && station.servesLine.length > 1,
    );
    expect(shared.length).toBeGreaterThan(0);
    const servedByOf = new Map(
      network.lines.map((line) => [line.uri, sortUris(line.servedBy)]),
    );
    for (const station of shared) {
      const stopSets = station.servesLine.map((line) =>
        servedByOf.get(line.uri),
      );
      for (const stops of stopSets) {
        expect(stops, station.uri).toEqual(stopSets.at(0));
      }
    }
  });
});
