import {
  NodeCard,
  NodeChip,
  NodeCommand,
  NodeRow,
  NodeTitle,
} from "../node/index.js";
import type { ProjectionMaps } from "./types.js";

/**
 * The maps every site starts from: each representation renders any node
 * through its `Node` arm, which reads only what every node carries. A site
 * adds a type's own arm by spreading over a map:
 * `{ ...defaultProjectionMaps, chip: { ...defaultProjectionMaps.chip, Station: StationChip } }`.
 */
export const defaultProjectionMaps: ProjectionMaps = {
  chip: { Node: NodeChip },
  row: { Node: NodeRow },
  card: { Node: NodeCard },
  command: { Node: NodeCommand },
  title: { Node: NodeTitle },
};
