/**
 * The site's own types that `DocsCardProjection` cases, each through its
 * own arm: the cases its coverage test walks, one node per type.
 */
export const DOCS_CARD_TYPES = {
  Component: true,
  Pattern: true,
  Layout: true,
  Modifier: true,
  ModifierFamily: true,
  CodeStandard: true,
} as const;
