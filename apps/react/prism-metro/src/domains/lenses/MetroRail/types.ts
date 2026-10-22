import type { RailProps } from "@canonical/prism-core";

/**
 * Props accepted by `MetroRail`: the native props of the rail's `<nav>`
 * root, passed through to `Rail`.
 *
 * `Rail`'s `brand`, `entries` and `children` are excluded because the metro
 * rail supplies all three: the site's brand, the lenses the running
 * router's table declares, and the site's utility cluster.
 */
export type MetroRailProps = Omit<RailProps, "brand" | "entries" | "children">;
