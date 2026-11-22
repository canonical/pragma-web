import type { StandardSchemaV1 } from "@canonical/router-core";
import type { SearchState, SearchValues } from "./types.js";

/** Keep a value only when it is a string with text in it. */
const readText = (value: unknown): string | undefined =>
  typeof value === "string" && value !== "" ? value : undefined;

/**
 * The search route's search schema: the text (`q`), the applied type
 * (`type`), the cursor the page starts after (`after`) and the page's
 * number (`page`); any other key is dropped.
 */
export const searchValues: StandardSchemaV1<
  Readonly<Record<string, unknown>>,
  SearchValues
> = {
  "~standard": {
    version: 1,
    vendor: "pragma-docs",
    validate: (value) => {
      const raw = value as Readonly<Record<string, unknown>>;
      const read: SearchValues = {
        q: readText(raw.q),
        type: readText(raw.type),
        after: readText(raw.after),
        page: readText(raw.page),
      };
      return {
        value: Object.fromEntries(
          Object.entries(read).filter(([, text]) => text !== undefined),
        ) as SearchValues,
      };
    },
  },
};

/**
 * Read the search page's state from its address values: a page number
 * that is not a whole number from 1 reads as the first page, whose
 * results start after no cursor.
 *
 * @param values - The route's search values.
 * @returns The text, the applied type, the cursor and the page.
 */
export function readSearchState(values: SearchValues): SearchState {
  const page = Number(values.page ?? "1");
  const isLater = Number.isInteger(page) && page > 1;
  return {
    text: values.q ?? "",
    type: values.type,
    after: isLater ? values.after : undefined,
    page: isLater && values.after !== undefined ? page : 1,
  };
}
