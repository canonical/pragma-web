import { readInstant } from "@canonical/dataviews-core/bindings";
import { spellPrimitiveValue } from "../../../utils/index.js";
import type {
  TimelineDecoration,
  TimelineFieldMapping,
  TimelineItem,
} from "../types.js";

const TEXT_PARTS = [
  "actorId",
  "actorName",
  "actorLink",
  "eventType",
  "eventLabel",
  "description",
] as const;

type TextPart = (typeof TEXT_PARTS)[number];

const readValue = (record: object, field: string): unknown =>
  Object.hasOwn(record, field)
    ? (record as Record<string, unknown>)[field]
    : undefined;

const readDateTime = (value: unknown): string => {
  const at = readInstant(value);
  if (at === null) {
    return "";
  }
  return typeof value === "string" ? value : new Date(at).toISOString();
};

/**
 * One record as a timeline event: its identity, its date as ISO 8601, and
 * every mapped part whose field holds text, extended by `decorate`. A date
 * the core reads no instant from is empty; a blank part is left out.
 *
 * Throws when `decorate` names the event's identity or date, which the
 * record alone decides.
 */
export default function mapRecord<TRow extends object>(
  record: TRow,
  rowId: string,
  mapping: TimelineFieldMapping,
  decorate?: (record: TRow, rowId: string) => TimelineDecoration,
): TimelineItem {
  const parts: Partial<Record<TextPart, string>> = {};
  for (const part of TEXT_PARTS) {
    const field = mapping[part];
    const text =
      field === undefined
        ? null
        : spellPrimitiveValue(readValue(record, field));
    if (text !== null && text.trim() !== "") {
      parts[part] = text;
    }
  }
  const decoration = decorate?.(record, rowId) ?? {};
  if (
    Object.hasOwn(decoration, "id") ||
    Object.hasOwn(decoration, "dateTime")
  ) {
    throw new Error(
      `decorate names the id or the dateTime of the event "${rowId}", which its record decides`,
    );
  }
  return {
    ...parts,
    ...decoration,
    id: rowId,
    dateTime: readDateTime(readValue(record, mapping.dateTime)),
  };
}
