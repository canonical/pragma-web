import {
  COLLISION_MARGIN,
  measurePathBounds,
  type Rect,
  uniteRects,
} from "@canonical/prism-core";
import layOutClassGraph from "../../../../classGraph/layOutClassGraph.js";
import placeBridgeLabels from "../../../../classGraph/placeBridgeLabels.js";
import type { ClassGraphLayout } from "../../../../classGraph/types.js";
import type { Translate } from "../../../../i18n/index.js";
import { SPECIMEN_MARGIN, SPECIMEN_PREFIX } from "./constants.js";
import type { Specimen } from "./types.js";

/**
 * Lay a legend specimen out with the graph's own layout and keep only what
 * it shows: its classes and edges without the regions' label rows, or its
 * one class alone; with the box that frames them and a bridge's label.
 *
 * @param specimen - The specimen.
 * @param t - The translator, for the classes' and predicates' names.
 * @returns The specimen's layout and its frame.
 */
export default function layOutSpecimen(
  specimen: Specimen,
  t: Translate,
): { readonly layout: ClassGraphLayout; readonly frame: Rect } {
  const prefixOf = (key: string): string =>
    specimen.classes.find((klass) => klass.key === key)?.prefix ??
    SPECIMEN_PREFIX;
  const uriOf = (key: string): string => `${prefixOf(key)}:${key}`;
  const full = layOutClassGraph({
    classes: specimen.classes.map((klass) => ({
      uri: uriOf(klass.key),
      label: t(klass.label),
      prefix: klass.prefix ?? SPECIMEN_PREFIX,
      abstract: klass.abstract ?? false,
      superclass:
        klass.superclass === undefined ? null : uriOf(klass.superclass),
      instanceCount: klass.instanceCount ?? 0,
      fields: 0,
      ...(klass.kind === undefined
        ? {}
        : {
            kind: klass.kind,
            term: t(klass.label),
            members: klass.members ?? 1,
            held: klass.held ?? 0,
          }),
    })),
    relations: specimen.relations.map((relation) => ({
      uri: uriOf(`${relation.domain}-${relation.range}`),
      label: t(relation.label),
      domain: uriOf(relation.domain),
      range: uriOf(relation.range),
      specimen: true as const,
    })),
  });
  const only = specimen.only === undefined ? undefined : uriOf(specimen.only);
  const nodes = [...full.nodes.values()].filter(
    (node) => only === undefined || node.uri === only,
  );
  const edges = only === undefined ? full.edges : [];
  const layout: ClassGraphLayout = {
    ...full,
    regions: [],
    nodes: new Map(nodes.map((node) => [node.uri, node])),
    edges,
    rail: nodes.map((node) => node.uri),
  };
  const bounds = uniteRects([
    ...nodes.map((node) => ({
      x: node.x - COLLISION_MARGIN,
      y: node.y - COLLISION_MARGIN - node.loopExtent,
      w: node.w + 2 * COLLISION_MARGIN + node.loopExtent,
      h: node.h + 2 * COLLISION_MARGIN + node.loopExtent,
    })),
    ...edges.flatMap((edge) => [edge.d, ...edge.heads].map(measurePathBounds)),
    // A bridge's label, drawn at rest, as the canvas places it.
    ...placeBridgeLabels(layout, t).placed.map((label) => label.box),
  ]);
  return {
    layout,
    frame: {
      x: Math.floor(bounds.x) - SPECIMEN_MARGIN,
      y: Math.floor(bounds.y) - SPECIMEN_MARGIN,
      w: Math.ceil(bounds.w) + 2 * SPECIMEN_MARGIN,
      h: Math.ceil(bounds.h) + 2 * SPECIMEN_MARGIN,
    },
  };
}
