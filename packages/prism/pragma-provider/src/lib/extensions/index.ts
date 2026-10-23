/**
 * The extensions domain's barrel: what the schema extensions this package
 * adds share, to reach the compiled `NodeConnection` and to serve nodes
 * through it exactly as `node(id:)` resolves them.
 *
 * @module extensions
 */

export { findNodeConnection } from "./findNodeConnection.js";
export { resolveNodeEdges } from "./resolveNodeEdges.js";
export { toNodeConnection } from "./toNodeConnection.js";
export type {
  ExtensionFactory,
  ExtensionLookups,
  NodeConnectionValue,
  NodeEdge,
  PageFlags,
} from "./types.js";
