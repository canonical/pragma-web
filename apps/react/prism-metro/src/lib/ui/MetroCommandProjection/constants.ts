/**
 * The types that `MetroCommandProjection` cases, the site's own and the
 * ontology class, each through its own arm: the cases its coverage test walks, one node per type.
 */
export const METRO_COMMAND_TYPES = {
  Station: true,
  Interchange: true,
  Line: true,
  Zone: true,
  RollingStock: true,
  Formation: true,
  Unit: true,
  CarType: true,
  OntologyClass: true,
} as const;
