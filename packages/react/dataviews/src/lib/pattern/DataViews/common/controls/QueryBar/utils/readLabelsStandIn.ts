import type { QueryBarLabelsStandIn } from "../types.js";

/** The record noun until the root names its records. */
const RECORDS = Object.freeze({ singular: "record", plural: "records" });

/** A field named by itself, as Filters names one without labels. */
const readFieldLabel = (field: string): string => field;

/**
 * The words the bar names the data by: each field by its own name, and
 * the records as records. A private stand-in for the labels the root will
 * hand its parts, removed when they land.
 *
 * @returns The field labels and the record noun.
 */
export default function readLabelsStandIn(): QueryBarLabelsStandIn {
  return { readFieldLabel, recordNoun: RECORDS };
}
