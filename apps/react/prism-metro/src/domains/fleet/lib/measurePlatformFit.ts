import type { LineFit, Overhang, PlatformLine } from "../types.js";

/**
 * Measure how a train fits the platforms of each line it runs on.
 *
 * For each line, the shortest known platform among the stops it calls at,
 * and every stop whose platform is shorter than the train, with how far the
 * train runs past it, the largest excess first and stops of equal excess by
 * title. A stop with no known platform length is left out of both.
 *
 * @param length - The train's length, in millimetres.
 * @param lines - The lines the train runs on, each with its stops.
 * @returns One fit per line, in the order the lines are given.
 */
export default function measurePlatformFit(
  length: number,
  lines: readonly PlatformLine[],
): readonly LineFit[] {
  return lines.map(({ title, code, stops }) => {
    const measured = stops.flatMap(({ title: stop, platformLength }) =>
      platformLength === null ? [] : [{ title: stop, platformLength }],
    );
    const overhangs: readonly Overhang[] = measured
      .filter(({ platformLength }) => platformLength < length)
      .map((stop) => ({ ...stop, excess: length - stop.platformLength }))
      .sort((a, b) => b.excess - a.excess || a.title.localeCompare(b.title));
    const shortest =
      measured.length === 0
        ? null
        : Math.min(...measured.map(({ platformLength }) => platformLength));
    return { title, code, shortest, overhangs };
  });
}
