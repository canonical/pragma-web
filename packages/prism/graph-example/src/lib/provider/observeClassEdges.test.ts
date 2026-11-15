import { describe, expect, it } from "vitest";
import { EDGE_DATASET } from "../../testing/fixtures.js";
import { GEO_NAMESPACE as G, METRO_NAMESPACE as M } from "./constants.js";
import { observeClassEdges } from "./observeClassEdges.js";

describe("observeClassEdges", () => {
  it("counts each stored statement under its subject's and object's class", () => {
    expect(
      observeClassEdges(EDGE_DATASET).map((observation) => [
        observation.property,
        observation.subjectClass,
        observation.objectClass,
        observation.count,
      ]),
    ).toEqual([
      [`${M}formations`, `${M}Line`, `${M}Formation`, 1],
      [`${M}routes`, `${M}Line`, `${M}Route`, 2],
      [`${M}calls`, `${M}Route`, `${M}Call`, 5],
      [`${M}stop`, `${M}Call`, `${M}Station`, 2],
      [`${M}stop`, `${M}Call`, `${M}Interchange`, 2],
      [`${M}reverse`, `${M}Route`, `${M}Route`, 1],
      [`${M}servesLine`, `${M}Station`, `${M}Line`, 1],
      [`${G}inZone`, `${M}Station`, `${G}Zone`, 1],
      [`${G}location`, `${M}Station`, `${G}GeoPoint`, 1],
      [`${M}diagramPosition`, `${M}Station`, `${M}DiagramPoint`, 1],
      [`${M}servesLine`, `${M}Interchange`, `${M}Line`, 1],
      [`${M}formations`, `${M}RollingStock`, `${M}Formation`, 1],
      [`${M}units`, `${M}Formation`, `${M}UnitPosition`, 1],
      [`${M}unit`, `${M}UnitPosition`, `${M}Unit`, 1],
      [`${M}cars`, `${M}Unit`, `${M}CarPosition`, 2],
      [`${M}carType`, `${M}CarPosition`, `${M}CarType`, 2],
    ]);
  });

  it("observes nothing in a dataset without instances", () => {
    expect(observeClassEdges({ ...EDGE_DATASET, entities: [] })).toEqual([]);
  });
});
