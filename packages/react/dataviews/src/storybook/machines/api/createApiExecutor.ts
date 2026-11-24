import {
  createArraySource,
  EMPTY_SLICE,
  type Predicate,
  type Slice,
} from "@canonical/dataviews-core";
import { API_COLLECTION, SEARCHED_FIELDS } from "./constants.js";
import type { ApiAnswer, ApiQuery, ApiRecord } from "./types.js";

/** One query as the slice core executes. */
const buildSlice = ({
  text,
  statuses,
  cores,
  search,
  sort,
}: ApiQuery): Slice => {
  const filter: Predicate[] = text.map(
    ({ field, operator, text: operand }) => ({
      field,
      operator,
      operands: [operand],
    }),
  );
  for (const operator of ["isAny", "isNone"] as const) {
    if (statuses[operator].length > 0) {
      filter.push({ field: "status", operator, operands: statuses[operator] });
    }
  }
  for (const operator of ["gte", "lte"] as const) {
    const bound = cores[operator];
    if (bound !== null) {
      filter.push({ field: "cores", operator, operands: [bound] });
    }
  }
  return { ...EMPTY_SLICE, filter, search, sort: sort === null ? [] : [sort] };
};

/**
 * Create the executor both endpoints answer from: core's array source over the records.
 * Each answer holds up to `limit` records from `offset`, the exact match count and the facets asked for.
 *
 * @note Impure: its source keeps the last query it executed.
 */
export default function createApiExecutor(
  records: readonly ApiRecord[],
): (query: ApiQuery, offset: number, limit: number) => ApiAnswer {
  const source = createArraySource({
    rows: records,
    collection: API_COLLECTION,
    searchFields: SEARCHED_FIELDS,
  });
  return (query, offset, limit) => {
    const delivery = source.readDelivery?.({
      requestId: "mock-api",
      slice: buildSlice(query),
      // One page from the first record, so any offset can start it.
      window: { page: 1, size: offset + limit, cursor: null, collapsed: [] },
      facets: query.facets,
    });
    // v8 ignore next 7 -- the array source answers every request, counting exactly
    if (
      delivery?.status !== "succeeded" ||
      delivery.page.counts.matched.kind !== "exact" ||
      delivery.page.facets === undefined
    ) {
      throw new Error("the array source did not answer in full");
    }
    return {
      rows: delivery.page.rows.slice(offset),
      matched: delivery.page.counts.matched.value,
      facets: delivery.page.facets,
    };
  };
}
