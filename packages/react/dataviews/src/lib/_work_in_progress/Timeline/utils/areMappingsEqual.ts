import type { TimelineFieldMapping } from "../types.js";

const PARTS = [
  "dateTime",
  "actorId",
  "actorName",
  "actorLink",
  "eventType",
  "eventLabel",
  "description",
] as const satisfies readonly (keyof TimelineFieldMapping)[];

/** Whether two mappings read every part of an event from the same field. */
export default function areMappingsEqual(
  a: TimelineFieldMapping,
  b: TimelineFieldMapping,
): boolean {
  return PARTS.every((part) => a[part] === b[part]);
}
