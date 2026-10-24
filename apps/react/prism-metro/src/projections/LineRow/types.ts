import type { NodeRowProps, SiteArmProps } from "@canonical/prism-projections";

/**
 * Props accepted by `LineRow`, a site arm: the props of the `Node`
 * projection's row it wraps, the node's key and the native props of its
 * `<li>` root, and the node's typename.
 */
export type LineRowProps = SiteArmProps<NodeRowProps>;
