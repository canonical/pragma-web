import type { ProjectionMaps } from "@canonical/prism-projections";
import type { ComponentProps } from "react";

/**
 * Props accepted by `LineRow`: the props every row arm receives, the node
 * read through the row's composite fragment and its home, then the native
 * props of the `<li>` the `Node` arm renders as the root.
 */
export type LineRowProps = ComponentProps<ProjectionMaps["row"]["Node"]>;
