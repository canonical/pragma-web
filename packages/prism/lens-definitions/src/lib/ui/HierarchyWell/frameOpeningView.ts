import type { GraphBox } from "@canonical/prism-core";
import type { ClassGraphLayout, LaidOutNode } from "../../classGraph/types.js";

/**
 * Frame the box the canvas opens on: the layout's view, which is the whole
 * graph when it fits at a legible zoom, else a window of it; a window
 * slides, within the graph, to centre the class selected on arrival, so a
 * term page opens on its term.
 *
 * @param layout - The class graph's layout.
 * @param selected - The class selected on arrival, if any.
 * @returns The canvas's viewBox.
 */
export default function frameOpeningView(
  layout: ClassGraphLayout,
  selected: LaidOutNode | undefined,
): GraphBox {
  const { view, viewBox } = layout;
  const centre = (
    start: number,
    span: number,
    from: number,
    room: number,
    size: number,
  ): number =>
    Math.min(
      Math.max(Math.round(start + size / 2 - span / 2), from),
      from + room - span,
    );
  const x =
    selected === undefined
      ? view.x
      : centre(selected.x, view.w, viewBox.x, viewBox.w, selected.w);
  const y =
    selected === undefined
      ? view.y
      : centre(selected.y, view.h, viewBox.y, viewBox.h, selected.h);
  return { x, y, width: view.w, height: view.h };
}
