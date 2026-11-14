import { listAncestorLevels } from "../lens/listAncestorLevels.js";
import type { TBoxOutline } from "../lens/types.js";
import type {
  ClassEdge,
  ClassEdgeDeclaration,
  ClassEdgeObservation,
} from "./types.js";

/** Order two IRIs by code unit, the same in every locale. */
const compareIris = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

/** Order edges by property, then subject class, then object class. */
const compareEdges = (a: ClassEdge, b: ClassEdge): number =>
  compareIris(a.property, b.property) ||
  compareIris(a.subjectClass, b.subjectClass) ||
  compareIris(a.objectClass, b.objectClass);

/**
 * Weigh the edges between classes: each declared edge with the number of
 * instance statements it covers, and each observed pair no declaration covers
 * as an undeclared edge.
 *
 * A declaration covers an observation of its property whose subject class is
 * its domain or a subclass of it, and whose object class is its range or a
 * subclass of it. A declared edge nothing covers is served with count 0.
 * Undeclared observations of the same property and pair are summed.
 *
 * @param declarations - The edges the ontology declares.
 * @param observations - The store's counts of statements by class pair.
 * @param outline - The class hierarchy subclass coverage is read from.
 * @returns The edges, sorted by property, subject class and object class.
 */
export function weighClassEdges(
  declarations: readonly ClassEdgeDeclaration[],
  observations: readonly ClassEdgeObservation[],
  outline: TBoxOutline,
): readonly ClassEdge[] {
  const parents = new Map(outline.classes.map((c) => [c.uri, c.parents]));
  const isWithin = (classUri: string, ancestor: string): boolean =>
    classUri === ancestor ||
    listAncestorLevels(classUri, parents).some((level) =>
      level.includes(ancestor),
    );
  const covers = (
    declaration: ClassEdgeDeclaration,
    observation: ClassEdgeObservation,
  ): boolean =>
    declaration.property === observation.property &&
    isWithin(observation.subjectClass, declaration.domain) &&
    isWithin(observation.objectClass, declaration.range);

  const declared = declarations.map(
    (declaration): ClassEdge => ({
      property: declaration.property,
      subjectClass: declaration.domain,
      objectClass: declaration.range,
      count: observations
        .filter((observation) => covers(declaration, observation))
        .reduce((sum, observation) => sum + observation.count, 0),
      declared: true,
    }),
  );

  const undeclared = new Map<string, ClassEdge>();
  for (const observation of observations) {
    if (declarations.some((declaration) => covers(declaration, observation))) {
      continue;
    }
    const key = JSON.stringify([
      observation.property,
      observation.subjectClass,
      observation.objectClass,
    ]);
    undeclared.set(key, {
      property: observation.property,
      subjectClass: observation.subjectClass,
      objectClass: observation.objectClass,
      count: (undeclared.get(key)?.count ?? 0) + observation.count,
      declared: false,
    });
  }

  return [...declared, ...undeclared.values()].sort(compareEdges);
}
