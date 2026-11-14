import type { ClassEdgeObservation } from "@canonical/prism-contract";
import {
  CALL_CLASS_URI,
  CAR_POSITION_CLASS_URI,
  DIAGRAM_POINT_CLASS_URI,
  GEO_POINT_CLASS_URI,
  STORED_OBJECT_PROPERTY_URIS as P,
  ROUTE_CLASS_URI,
  UNIT_POSITION_CLASS_URI,
} from "./constants.js";
import type { ExampleDataset, ExampleEntity, ExampleRoute } from "./types.js";

/** Counts statements by property, subject class and object class. */
interface ObservationTally {
  /** Count one statement; an object of no known class is not counted. */
  readonly observe: (
    subjectClass: string,
    property: string,
    objectClass: string | undefined,
  ) => void;
  readonly observations: () => readonly ClassEdgeObservation[];
}

/** An empty tally, its counts keyed by property and class pair. */
const createTally = (): ObservationTally => {
  const counts = new Map<string, ClassEdgeObservation>();
  return {
    observe: (subjectClass, property, objectClass) => {
      if (objectClass === undefined) return;
      const key = JSON.stringify([property, subjectClass, objectClass]);
      counts.set(key, {
        property,
        subjectClass,
        objectClass,
        count: (counts.get(key)?.count ?? 0) + 1,
      });
    },
    observations: () => [...counts.values()],
  };
};

/**
 * The statements the dataset stores between classes, counted by property and
 * class pair: every object-property value an entity holds, nested values
 * included (a line's routes and their calls, a formation's units, a unit's
 * cars). A statement is counted under its subject's and its object's class,
 * each record having one, so the observations of a property sum to its
 * statements. A reference to a record the dataset lacks is not a statement
 * between classes and is not counted.
 *
 * @param dataset - The dataset whose ABox is read.
 * @returns One observation per property and class pair the ABox links.
 */
export const observeClassEdges = (
  dataset: ExampleDataset,
): readonly ClassEdgeObservation[] => {
  const typeByUri = new Map(
    dataset.entities.map((entity) => [entity.uri, entity.type]),
  );
  const tally = createTally();
  const observeEach = (
    subjectClass: string,
    property: string,
    uris: readonly string[] | undefined,
  ): void => {
    for (const uri of uris ?? []) {
      tally.observe(subjectClass, property, typeByUri.get(uri));
    }
  };
  const observeRoute = (
    route: ExampleRoute,
    routes: readonly ExampleRoute[],
  ): void => {
    for (const stop of route.calls) {
      tally.observe(ROUTE_CLASS_URI, P.calls, CALL_CLASS_URI);
      tally.observe(CALL_CLASS_URI, P.stop, typeByUri.get(stop));
    }
    if (routes.some((other) => other.key === route.reverse)) {
      tally.observe(ROUTE_CLASS_URI, P.reverse, ROUTE_CLASS_URI);
    }
  };
  const observeEntity = (entity: ExampleEntity): void => {
    const subject = entity.type;
    switch (entity.typename) {
      case "RollingStock":
        observeEach(subject, P.formations, entity.formations);
        return;
      case "Formation":
        for (const placement of entity.units) {
          tally.observe(subject, P.units, UNIT_POSITION_CLASS_URI);
          tally.observe(
            UNIT_POSITION_CLASS_URI,
            P.unit,
            typeByUri.get(placement.unit),
          );
        }
        return;
      case "Unit":
        for (const placement of entity.cars) {
          tally.observe(subject, P.cars, CAR_POSITION_CLASS_URI);
          tally.observe(
            CAR_POSITION_CLASS_URI,
            P.carType,
            typeByUri.get(placement.carType),
          );
        }
        return;
      case "CarType":
        return;
      default: {
        observeEach(subject, P.servesLine, entity.servesLine);
        observeEach(subject, P.formations, entity.formations);
        if (entity.inZone !== undefined) {
          tally.observe(subject, P.inZone, typeByUri.get(entity.inZone));
        }
        if (entity.location !== undefined) {
          tally.observe(subject, P.location, GEO_POINT_CLASS_URI);
        }
        if (entity.diagramPosition !== undefined) {
          tally.observe(subject, P.diagramPosition, DIAGRAM_POINT_CLASS_URI);
        }
        const routes = entity.routes ?? [];
        for (const route of routes) {
          tally.observe(subject, P.routes, ROUTE_CLASS_URI);
          observeRoute(route, routes);
        }
      }
    }
  };
  for (const entity of dataset.entities) observeEntity(entity);
  return tally.observations();
};
