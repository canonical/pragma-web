import type { GraphBox } from "@canonical/prism-core";
import frameRegionWindow from "../../classGraph/frameRegionWindow.js";
import type { ClassGraphLayout } from "../../classGraph/types.js";
import measureVisibleBox from "./measureVisibleBox.js";

/**
 * Frame the box the camera fits when a reader picks a region: the window
 * `frameRegionWindow` chooses for the canvas the well draws, so no edge
 * cuts a box; the region's own frame when the canvas is not measured yet
 * or the frame is too large for the legible zoom.
 *
 * @param layout - The class graph's layout.
 * @param hidden - The classes the chips hide, which no window holds.
 * @param prefix - The region picked.
 * @param root - The well's element, whose desktop canvas is measured.
 * @returns The box to fit, or undefined when the region shows nothing.
 * @note Impure: reads the canvas's size on screen.
 */
export default function frameRegionRequest(
  layout: ClassGraphLayout,
  hidden: ReadonlySet<string>,
  prefix: string,
  root: Element | null,
): GraphBox | undefined {
  const box = measureVisibleBox(layout, hidden, prefix);
  if (box === undefined) return undefined;
  const canvas = root
    ?.querySelector(".desktop svg.viewport")
    ?.getBoundingClientRect() ?? { width: 0, height: 0 };
  if (canvas.width === 0 || canvas.height === 0) return box;
  const shown = frameRegionWindow(
    {
      nodes: new Map([...layout.nodes].filter(([uri]) => !hidden.has(uri))),
      regions: layout.regions,
    },
    { w: canvas.width, h: canvas.height },
    { x: box.x, y: box.y, w: box.width, h: box.height },
    {
      wide: layout.regions.some(
        (candidate) => candidate.prefix === prefix && candidate.collapsed,
      ),
    },
  );
  return shown === undefined
    ? box
    : { x: shown.x, y: shown.y, width: shown.w, height: shown.h };
}
