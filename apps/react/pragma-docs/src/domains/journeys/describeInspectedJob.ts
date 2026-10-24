import {
  describeCoordinate,
  localName,
  type RawJob,
} from "./collectJourneys.js";
import type { InspectedJob, JourneyCoordinate } from "./types.js";

/**
 * Join the selected job against the model the explorer's operation already
 * holds: its label from the coordinate tree, its story, acceptance criteria
 * and coordinate from the raw job, and every pairing that serves it. No
 * second query is needed, since the whole demand model is one operation.
 *
 * @param coordinates - The coordinate tree `collectJourneys` builds.
 * @param jobs - The operation's jobs, as it delivers them.
 * @param job - The selected job's URI, or undefined on the lens index.
 * @returns The inspected job, or undefined when none is selected or the
 *   model holds no job at that URI.
 */
export default function describeInspectedJob(
  coordinates: readonly JourneyCoordinate[],
  jobs: readonly RawJob[],
  job: string | undefined,
): InspectedJob | undefined {
  if (job === undefined) return undefined;
  const entry = coordinates
    .flatMap((coordinate) => coordinate.jobs)
    .find((candidate) => candidate.uri === job);
  if (entry === undefined) return undefined;
  const raw = jobs.find((candidate) => candidate.uri === job);
  return {
    uri: entry.uri,
    label: entry.label ?? localName(entry.uri),
    story: raw?.story ?? undefined,
    acceptances: (raw?.acceptances ?? []).filter(
      (value): value is string => typeof value === "string",
    ),
    coordinate: describeCoordinate(raw?.coordinates),
    pairings: entry.pairings,
  };
}
