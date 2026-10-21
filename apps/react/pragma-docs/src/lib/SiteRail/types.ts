import type { RailProps } from "#lib/Rail";

/**
 * Props accepted by `SiteRail`: the native props of the rail's `<nav>`
 * root, passed through to `Rail`.
 *
 * `Rail`'s `brand` and `entries` are excluded because the site rail supplies
 * both: the site's brand, and the lenses the running router's table
 * declares.
 */
export type SiteRailProps = Omit<RailProps, "brand" | "entries">;
