/**
 * The site's own types that `MetroGraphNodeProjection` cases, each through its
 * own arm: the cases its coverage test walks, one node per type.
 */
export const METRO_GRAPH_NODE_TYPES = {
  Station: true,
  Interchange: true,
  Line: true,
  Zone: true,
  RollingStock: true,
  Formation: true,
  Unit: true,
  CarType: true,
} as const;
