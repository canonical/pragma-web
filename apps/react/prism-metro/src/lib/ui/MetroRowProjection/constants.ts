/**
 * The site's own types that `MetroRowProjection` cases, each through its
 * own arm: the cases its coverage test walks, one node per type.
 */
export const METRO_ROW_TYPES = {
  Station: true,
  Interchange: true,
  Line: true,
  Zone: true,
  RollingStock: true,
  Formation: true,
  Unit: true,
  CarType: true,
} as const;
