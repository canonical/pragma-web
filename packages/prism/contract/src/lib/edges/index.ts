/**
 * Class edges: the edges an ontology declares, weighed by the instance
 * statements a store holds, and the observed edges it does not declare.
 *
 * @module edges
 */

export type {
  ClassEdge,
  ClassEdgeDeclaration,
  ClassEdgeObservation,
} from "./types.js";
export { weighClassEdges } from "./weighClassEdges.js";
