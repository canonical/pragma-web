/**
 * The site's own types that `DocsCommandProjection` cases, each through its
 * own arm: the cases its coverage test walks, one node per type.
 */
export const DOCS_COMMAND_TYPES = {
  Component: true,
  Pattern: true,
  Layout: true,
  Modifier: true,
  ModifierFamily: true,
  CodeStandard: true,
} as const;
