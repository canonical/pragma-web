import type { Translate } from "../i18n/index.js";
import type { ClassGraphLayout, LaidOutNode } from "./types.js";

/**
 * Name what a collapsed namespace's box holds, for the messages that name
 * it to assistive technology on the canvas and in the phone view: its
 * prefix, its classes, the instances of them, the relations it states,
 * and the relations drawn
 * from it, which are what leaves the box.
 *
 * @param layout - The edges drawn.
 * @param node - The box.
 * @param t - The lens's translator.
 * @returns The values of `well.name.region` and `well.name.region.open`.
 */
export default function nameRegionBox(
  layout: Pick<ClassGraphLayout, "edges">,
  node: Pick<
    LaidOutNode,
    "uri" | "region" | "members" | "held" | "instanceCount"
  >,
  t: Translate,
): {
  readonly prefix: string;
  readonly classes: string;
  readonly instances: string;
  readonly held: string;
  readonly relations: string;
} {
  return {
    prefix: node.region,
    classes: t("well.region.count", { count: node.members }),
    instances: t("well.instances.count", { count: node.instanceCount }),
    held: t("well.relations.count", { count: node.held }),
    relations: t("well.relations.count", {
      count: layout.edges.filter(
        (edge) =>
          edge.kind === "relation" &&
          (edge.from === node.uri || edge.to.includes(node.uri)),
      ).length,
    }),
  };
}
