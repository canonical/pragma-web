/**
 * The `@canonical/styles` presets the shell's root carries: `grid` lays it
 * out as a grid with the gutter gaps, and `intrinsic` gives it the fluid
 * columns in groups of four.
 */
export const GRID_PRESET_CLASS_NAMES = ["grid", "intrinsic"] as const;

/**
 * The site's home namespace, as its CURIEs write it: a design-system
 * identity shows no prefix on the site's pages, and one of another
 * namespace (a `cs:` standard) shows its own (heuristic 4.3). A lens whose
 * pages are of another namespace declares its own.
 */
export const AMBIENT_NAMESPACE = "ds";
