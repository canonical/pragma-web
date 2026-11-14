/**
 * The `@canonical/styles` presets the shell's root carries: `grid` lays it
 * out as a grid with the gutter gaps, and `intrinsic` gives it the fluid
 * columns in groups of four.
 */
export const GRID_PRESET_CLASS_NAMES = ["grid", "intrinsic"] as const;

/**
 * The namespace the whole site is about, as its CURIEs write it: a metro
 * identity shows no prefix anywhere on the site, and one of another
 * namespace (a `geo:` place) shows its own (heuristic 4.3).
 */
export const AMBIENT_NAMESPACE = "metro";
