import type {
  CardArmNative,
  ChipArmNative,
  CommandArmNative,
  GraphNodeArmNative,
  ProjectionMap,
  RowArmNative,
} from "@canonical/prism-projections";
import type { SiteCardProjection_node$data } from "../../relay/__generated__/SiteCardProjection_node.graphql.js";
import type { SiteChipProjection_node$data } from "../../relay/__generated__/SiteChipProjection_node.graphql.js";
import type { SiteCommandProjection_node$data } from "../../relay/__generated__/SiteCommandProjection_node.graphql.js";
import type { SiteGraphNodeProjection_node$data } from "../../relay/__generated__/SiteGraphNodeProjection_node.graphql.js";
import type { SiteRowProjection_node$data } from "../../relay/__generated__/SiteRowProjection_node.graphql.js";

/**
 * The site's arms of every form: each form's composite arms the
 * design-system types and hands every other node to the package's
 * dispatcher, its `Node` arm. A map's typed arms are exactly its
 * composite's aliases, so a wrong or missing arm does not compile.
 */
export interface SiteProjectionMaps {
  /** The inline mention: a node named in running text. */
  readonly chip: ProjectionMap<SiteChipProjection_node$data, ChipArmNative>;
  /** The list row: a node as one entry of a list of results. */
  readonly row: ProjectionMap<SiteRowProjection_node$data, RowArmNative>;
  /** The card: a node as a self-contained tile in a grid of entities. */
  readonly card: ProjectionMap<SiteCardProjection_node$data, CardArmNative>;
  /** The command-palette entry: a node offered as a destination. */
  readonly command: ProjectionMap<
    SiteCommandProjection_node$data,
    CommandArmNative
  >;
  /** The graph node: a node of a graph, native SVG. */
  readonly graphNode: ProjectionMap<
    SiteGraphNodeProjection_node$data,
    GraphNodeArmNative
  >;
}
