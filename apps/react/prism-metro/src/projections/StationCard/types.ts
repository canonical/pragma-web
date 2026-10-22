import type { ProjectionMaps } from "@canonical/prism-projections";
import type { ComponentProps } from "react";

/**
 * Props accepted by `StationCard`: the props every card arm receives, the
 * node read through the card's composite fragment and its home, then the
 * native props of the `<article>` the `Node` arm renders as the root.
 */
export type StationCardProps = ComponentProps<ProjectionMaps["card"]["Node"]>;
