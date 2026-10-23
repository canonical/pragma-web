import type { ReactNode } from "react";

/**
 * Tell whether a node renders anything: React renders nothing for `null`,
 * `undefined`, a boolean or the empty string, so a region given one of
 * those is absent, as if the prop were omitted. A conditional slot such as
 * `inspector={open && <Inspector />}` then leaves no empty region behind.
 *
 * @param node - The node a layout was given for one of its regions.
 * @returns Whether the region holds something to render.
 */
export default function isRenderedNode(node: ReactNode): boolean {
  return (
    node !== null &&
    node !== undefined &&
    typeof node !== "boolean" &&
    node !== ""
  );
}
