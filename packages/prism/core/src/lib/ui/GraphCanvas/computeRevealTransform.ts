import type { GraphBox, GraphTransform } from "./types.js";

/**
 * Compute the camera that brings a world box into view without zooming:
 * the box centred in the visible area, or `undefined` when the current
 * camera already shows the whole box, so a reader's view only moves when it
 * must.
 *
 * @param visible - The viewport's visible area, in its user units.
 * @param camera - The current camera.
 * @param box - The world box to bring into view.
 * @returns The panned camera, or `undefined` when nothing needs to move.
 */
export default function computeRevealTransform(
  visible: GraphBox,
  camera: GraphTransform,
  box: GraphBox,
): GraphTransform | undefined {
  const left = camera.x + camera.k * box.x;
  const top = camera.y + camera.k * box.y;
  const inView =
    left >= visible.x &&
    top >= visible.y &&
    left + camera.k * box.width <= visible.x + visible.width &&
    top + camera.k * box.height <= visible.y + visible.height;
  if (inView) return undefined;
  return {
    k: camera.k,
    x: visible.x + visible.width / 2 - camera.k * (box.x + box.width / 2),
    y: visible.y + visible.height / 2 - camera.k * (box.y + box.height / 2),
  };
}
