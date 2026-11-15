/**
 * The level a component's text's shallowest heading renders at: the page's
 * title is its only `h1` and its sections' headings its only `h2`s, so the
 * text that a section holds starts one level below them, whatever level
 * its author started it at.
 */
export const PROSE_TOP_LEVEL = 3;

/** The deepest heading level HTML has: a deeper one stays at it. */
export const PROSE_BOTTOM_LEVEL = 6;

/** The six heading tags, in level order. */
export const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
