/**
 * The site's own types that `DocsGraphNodeProjection` cases, each through its
 * own arm: the cases its coverage test walks, one node per type.
 */
export const DOCS_GRAPH_NODE_TYPES = {
  Component: true,
  Pattern: true,
  Layout: true,
  Modifier: true,
  ModifierFamily: true,
  CodeStandard: true,
} as const;
