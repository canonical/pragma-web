import type { JourneyFilter } from "./journeyFilter.js";
import type { JourneyCoordinate, JourneyScope } from "./types.js";

/**
 * Describe what the graph draws, for the inspector's overview when no job
 * is selected: the drawn coordinate in words, or none when the filter
 * draws every coordinate, and how many of its jobs a surface serves and
 * how many nothing does.
 *
 * @param coordinates - The coordinate tree `collectJourneys` builds.
 * @param filter - The filter in force.
 * @param drawn - The coordinates the filter keeps.
 * @returns The scope, counted.
 */
export default function describeJourneyScope(
  coordinates: readonly JourneyCoordinate[],
  filter: JourneyFilter,
  drawn: readonly JourneyCoordinate[],
): JourneyScope {
  const jobs = drawn.flatMap((coordinate) => coordinate.jobs);
  const served = jobs.filter((job) => job.pairings.length > 0).length;
  const coordinate =
    filter.coordinate === undefined
      ? undefined
      : coordinates.find((entry) => entry.uri === filter.coordinate);
  return {
    coordinate:
      coordinate === undefined
        ? undefined
        : (coordinate.label ?? coordinate.uri),
    jobs: jobs.length,
    served,
    unserved: jobs.length - served,
  };
}
