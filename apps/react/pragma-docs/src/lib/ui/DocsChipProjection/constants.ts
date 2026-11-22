/**
 * The site's own types and the ontology class that `DocsChipProjection` cases, each through its
 * own arm: the cases its coverage test walks, one node per type.
 */
export const DOCS_CHIP_TYPES = {
  Component: true,
  Pattern: true,
  Layout: true,
  Modifier: true,
  ModifierFamily: true,
  CodeStandard: true,
  OntologyClass: true,
} as const;
