import layOutRegion from "./layOutRegion.js";
import type { GraphLayout } from "./types.js";

/**
 * The layered engine on the graph layout contract: lay out one region of
 * nodes as layered columns, root at the left, and route its edges.
 *
 * @param nodes - The nodes to place, with their hierarchy.
 * @param edges - The bundles to route and the relations in them.
 * @param options - The region's nodes, its channel, its sweeps and the
 *   ports of its relations to other regions.
 * @returns The region's layout: positions, routes and findings.
 */
const layoutLayered: GraphLayout = (nodes, edges, options) =>
  layOutRegion(
    { ...nodes, ...edges },
    options.ids,
    options.channel,
    options.sweeps,
    options.crossPorts,
  );

export default layoutLayered;
