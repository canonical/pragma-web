import type {
  DataViewsMessages,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { QueryBarPart } from "./types.js";

/** The format props an Entry takes: a template always with its words. */
type EntryFormat =
  | {
      readonly template?: undefined;
      readonly formatDescription?: string;
      readonly suffix?: string;
    }
  | { readonly template: string; readonly formatDescription: string };

/** The calendar date as a date value is typed: data, never translated. */
const DATE_TEMPLATE = "YYYY-MM-DD";

/**
 * How the Entry shapes the value being typed: a date's template behind the
 * text and its format in words; a number's units in words, and its base
 * unit after the text while no unit is typed. Every other part, and every
 * other kind, takes none. Pure.
 *
 * @param definition - The draft's field.
 * @param part - The part the Entry takes.
 * @param typed - What is typed in it.
 * @param messages - The root's messages.
 * @returns The Entry's `template`, `formatDescription` and `suffix`.
 */
export default function entryFormat(
  definition: SchemaFieldDefinition | undefined,
  part: QueryBarPart,
  typed: string,
  messages: Pick<DataViewsMessages, "dateFormat" | "numberFormat">,
): EntryFormat {
  if (part !== "value" || definition === undefined) return {};
  if (definition.kind === "date") {
    return { template: DATE_TEMPLATE, formatDescription: messages.dateFormat };
  }
  if (definition.kind !== "number") return {};
  const { units } = definition;
  const formatDescription = messages.numberFormat(
    units?.display.map(({ symbol }) => symbol) ?? [],
  );
  // A unit typed after the digits stands in place of the base one.
  return units === undefined || /\p{L}/u.test(typed)
    ? { formatDescription }
    : { formatDescription, suffix: units.base };
}
