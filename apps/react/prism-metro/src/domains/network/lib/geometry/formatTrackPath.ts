import type { DrawingPoint } from "./types.js";

/** Write a coordinate with at most two decimals, so the markup stays short and stable. */
const formatNumber = (value: number): string =>
  String(Math.round(value * 100) / 100);

/**
 * Write a track's vertices as SVG path data: a move to the first, a line to
 * each next, and a close when the track is a loop.
 *
 * @param points - The vertices, at least two.
 * @param closed - Whether the track returns to its first vertex.
 * @returns The path's `d` attribute.
 */
export default function formatTrackPath(
  points: readonly DrawingPoint[],
  closed: boolean,
): string {
  const commands = points.map(
    ({ x, y }, index) =>
      `${index === 0 ? "M" : "L"}${formatNumber(x)} ${formatNumber(y)}`,
  );
  return closed ? `${commands.join(" ")} Z` : commands.join(" ");
}
