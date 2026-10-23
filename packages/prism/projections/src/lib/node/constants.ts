import {
  OntologyClassCard,
  OntologyClassChip,
  OntologyClassCommand,
  OntologyClassRow,
} from "../ontology/index.js";
import type { ProjectionMaps } from "../projections/index.js";
import { NodeCard } from "./NodeCard/index.js";
import { NodeChip } from "./NodeChip/index.js";
import { NodeCommand } from "./NodeCommand/index.js";
import { NodeRow } from "./NodeRow/index.js";

/**
 * The maps a site mounts: each form renders any node through its `Node`
 * arm, which reads only what every node carries, and each type the
 * package projects through that type's own arm. A map's typed arms are
 * exactly the composite's aliased spreads; a site adds arms for its own
 * types under `siteTypes`.
 */
export const defaultProjectionMaps: ProjectionMaps = {
  chip: { Node: NodeChip, types: { OntologyClass: OntologyClassChip } },
  row: { Node: NodeRow, types: { OntologyClass: OntologyClassRow } },
  card: { Node: NodeCard, types: { OntologyClass: OntologyClassCard } },
  command: {
    Node: NodeCommand,
    types: { OntologyClass: OntologyClassCommand },
  },
};
