import type { GraphBox } from "@canonical/prism-core";
import frameLegibleWindow from "../../classGraph/frameLegibleWindow.js";
import type { ClassGraphLayout } from "../../classGraph/types.js";

/**
 * Choose the window a fit shows of a box too large to fit at its floor,
 * such as the classes a chip leaves or a region a reader picked at the
 * legible zoom, or the whole graph a Fit shows at the overview's floor: a
 * window at that floor from the box's top-left corner whose edges cut
 * through no class the filter leaves drawn and no region's label, in the
 * aspect of the canvas the client has measured.
 *
 * @param layout - The class graph's layout.
 * @param hidden - The classes the filter hides, which no edge can cut.
 * @param box - The box to refit to.
 * @param visible - The area of user space the viewport shows at the identity.
 * @param scale - The on-screen size of one user unit at the identity.
 * @param zoom - The fit's floor, as an on-screen zoom.
 * @returns The window, in world units.
 */
export default function frameRefitWindow(
  layout: ClassGraphLayout,
  hidden: ReadonlySet<string>,
  box: GraphBox,
  visible: GraphBox,
  scale: number,
  zoom: number,
): GraphBox {
  const { x, y, w, h } = frameLegibleWindow(
    {
      nodes: new Map([...layout.nodes].filter(([uri]) => !hidden.has(uri))),
      regions: layout.regions,
      viewBox: layout.viewBox,
    },
    { w: visible.width * scale, h: visible.height * scale },
    { within: { x: box.x, y: box.y, w: box.width, h: box.height }, zoom },
  );
  return { x, y, width: w, height: h };
}
