import type { NodeCardProps, SiteArmProps } from "@canonical/prism-projections";

/**
 * Props accepted by `StationCard`, a site arm: the props of the `Node`
 * projection's card it wraps, the node's key and the native props of its
 * `<div>` root, and the node's typename.
 */
export type StationCardProps = SiteArmProps<NodeCardProps>;
