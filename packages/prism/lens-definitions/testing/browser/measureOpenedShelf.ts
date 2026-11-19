import type { OpenedShelfMeasure } from "./types.js";

/**
 * Measure, in a browser, an opened view's shelves and label rows: each
 * namespace's box and whether it lies across the canvas's whole width, to
 * within `tolerance` px; each bridge a region's label row names, in the
 * row's order, with the relations it counts; and whether a name sits
 * inside the way back's link.
 *
 * @param tolerance - The sub-pixel rounding allowed, in px.
 * @returns The opened view's measure.
 * @note Impure: reads the page's live DOM; pass it to `page.evaluate`.
 */
export default function measureOpenedShelf(
  tolerance: number,
): OpenedShelfMeasure {
  const svg = document.querySelector(".ds.graph-canvas svg.viewport");
  const frame = svg?.getBoundingClientRect();
  if (svg === null || frame === undefined) {
    return { boxes: [], names: [], namesInWayBack: false };
  }
  const boxes = [...svg.querySelectorAll('g.node[data-kind="region"]')].map(
    (node) => {
      const box = (
        node.querySelector(".surface") ?? node
      ).getBoundingClientRect();
      return {
        id: node.getAttribute("data-id") ?? "",
        across:
          box.left >= frame.left - tolerance &&
          box.right <= frame.right + tolerance,
      };
    },
  );
  const names = [...svg.querySelectorAll("g.region")].flatMap((region) =>
    [...region.querySelectorAll(".region-bridges tspan")].map((name) => ({
      ns: region.getAttribute("data-ns") ?? "",
      to: name.getAttribute("data-ns") ?? "",
      relations: Number(name.getAttribute("data-relations")),
    })),
  );
  return {
    boxes,
    names,
    namesInWayBack: svg.querySelector(".way-back .region-bridges") !== null,
  };
}
