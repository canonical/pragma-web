import type { ProjectionMaps } from "../projections/index.js";
import { NodeCard } from "./NodeCard/index.js";
import { NodeChip } from "./NodeChip/index.js";
import { NodeCommand } from "./NodeCommand/index.js";
import { NodeRow } from "./NodeRow/index.js";
import { NodeTitle } from "./NodeTitle/index.js";

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
