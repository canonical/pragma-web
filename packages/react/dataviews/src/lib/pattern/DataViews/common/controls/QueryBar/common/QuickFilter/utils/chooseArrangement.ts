import type {
  PredicateOperator,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { QuickFilterArrangement } from "../types.js";

/** The fewest declared values a quick filter shows as words by default. */
const WORDS_AT_LEAST = 2;

/** The most declared values a quick filter shows as words by default. */
const WORDS_AT_MOST = 5;

/**
 * How a field shows as a quick filter: as words where it is a choice of
 * one value at a time among a few the schema declares, from two to five,
 * and its source offers any-of, which the words write; otherwise as a
 * filter button. An arrangement asked for wins, and words are asked for
 * only of a choice with declared values whose source offers any-of.
 *
 * @param definition - The field.
 * @param asked - The arrangement the host asked for, if any.
 * @param offered - The operators the source offers on the field.
 * @returns The arrangement.
 * @throws Error where words are asked for of a field they cannot show.
 */
export default function chooseArrangement(
  definition: SchemaFieldDefinition,
  asked: QuickFilterArrangement | undefined,
  offered: readonly PredicateOperator[],
): QuickFilterArrangement {
  const options =
    definition.kind === "choices" ? definition.options : undefined;
  if (asked === "words" && options === undefined) {
    throw new Error(
      `DataViews.QueryBar: the quick filter "${definition.field}" can show as words only with the values its schema declares`,
    );
  }
  if (asked === "words" && !offered.includes("isAny")) {
    throw new Error(
      `DataViews.QueryBar: the quick filter "${definition.field}" can show as words only where its source offers any-of`,
    );
  }
  if (asked !== undefined) return asked;
  return definition.kind === "choices" &&
    definition.multiple !== true &&
    offered.includes("isAny") &&
    options !== undefined &&
    options.length >= WORDS_AT_LEAST &&
    options.length <= WORDS_AT_MOST
    ? "words"
    : "button";
}
