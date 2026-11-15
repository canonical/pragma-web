/**
 * The site's own types that `DocsChipProjection` cases, each through its
 * own arm: the cases its coverage test walks, one node per type.
 */
export const DOCS_CHIP_TYPES = {
  Component: true,
  Pattern: true,
  Layout: true,
  Modifier: true,
  ModifierFamily: true,
  CodeStandard: true,
} as const;
