import type { WeightLinkMeasure } from "./types.js";

/**
 * Measure, in the page, each count's numeral the desktop canvas shows: its
 * count and address, its centre on screen, whether it lies wholly inside
 * the canvas's frame, and whether any point of its box falls on a drawn
 * line's stroke or on an arrowhead. Pass it to `page.evaluate`: it reads
 * only the document.
 *
 * @note Impure: reads the document.
 */
export default function measureWeightLinks(): WeightLinkMeasure[] {
  const svg = document.querySelector<SVGSVGElement>(
    ".ds.graph-canvas svg.viewport",
  );
  const frame = document
    .querySelector(".ds.graph-canvas")
    ?.getBoundingClientRect();
  if (svg === null || frame === undefined) return [];
  const isDrawn = (element: Element): boolean =>
    getComputedStyle(element).display !== "none" &&
    element.getBoundingClientRect().width > 0;
  const lines = [
    ...svg.querySelectorAll<SVGPathElement>(
      "path.relation, path.subclass, path.chain",
    ),
  ].filter(isDrawn);
  const heads = [
    ...svg.querySelectorAll<SVGPathElement>("path.filled-head, path.head-fill"),
  ].filter(isDrawn);
  // A 1px tolerance at the frame's edge absorbs sub-pixel rounding.
  const tolerance = 1;
  return [...svg.querySelectorAll<SVGAElement>("a.weight-link")].flatMap(
    (link) => {
      const rect = link.querySelector("rect");
      if (rect === null || !isDrawn(rect)) return [];
      const x = rect.x.baseVal.value;
      const y = rect.y.baseVal.value;
      const w = rect.width.baseVal.value;
      const h = rect.height.baseVal.value;
      const points = [0.1, 0.3, 0.5, 0.7, 0.9].flatMap((u) =>
        [0.2, 0.5, 0.8].map((v) => new DOMPoint(x + u * w, y + v * h)),
      );
      const screen = rect.getBoundingClientRect();
      return [
        {
          count: Number(link.getAttribute("data-count")),
          href: link.getAttribute("href") ?? "",
          tabIndex: link.getAttribute("tabindex") ?? "",
          centre: {
            x: screen.x + screen.width / 2,
            y: screen.y + screen.height / 2,
          },
          inFrame:
            screen.left >= frame.left - tolerance &&
            screen.top >= frame.top - tolerance &&
            screen.right <= frame.right + tolerance &&
            screen.bottom <= frame.bottom + tolerance,
          onLine: lines.some((line) =>
            points.some((point) => line.isPointInStroke(point)),
          ),
          onHead: heads.some((head) =>
            points.some(
              (point) =>
                head.isPointInFill(point) || head.isPointInStroke(point),
            ),
          ),
        },
      ];
    },
  );
}
