import {
  NodeCard,
  NodeChip,
  NodeCommand,
  NodeRow,
  NodeTitle,
} from "../node/index.js";
import type { ProjectionMaps } from "./types.js";

/**
 * The maps a site mounts: each representation renders any node through its
 * `Node` arm, which reads only what every node carries. They hold exactly
 * the arms the package's composites spread; an arm the composites do not
 * spread would read only what they already select.
 */
export const defaultProjectionMaps: ProjectionMaps = {
  chip: { Node: NodeChip },
  row: { Node: NodeRow },
  card: { Node: NodeCard },
  command: { Node: NodeCommand },
  title: { Node: NodeTitle },
};
