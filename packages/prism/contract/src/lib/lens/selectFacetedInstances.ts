import type {
  FacetCount,
  FacetedSelection,
  FacetFilter,
  FacetRow,
  FacetSort,
  FacetValueCount,
  ListField,
  ReadValue,
} from "./types.js";

/** The key a value is filtered and counted by: its IRI, else its text. */
const readValueKey = (value: ReadValue): string => value.uri ?? value.text;

const readRowValues = (row: FacetRow, field: string): readonly ReadValue[] =>
  row.values[field] ?? [];

const holdsValue = (row: FacetRow, field: string, wanted: string | null) => {
  const values = readRowValues(row, field);
  return wanted === null
    ? values.length === 0
    : values.some((value) => readValueKey(value) === wanted);
};

const matchesFilters = (row: FacetRow, filters: readonly FacetFilter[]) =>
  filters.every((filter) =>
    filter.values.some((wanted) => holdsValue(row, filter.field, wanted)),
  );

const compareTexts = (a: string, b: string): number =>
  a.localeCompare(b, "en", { numeric: true });

/**
 * A field's buckets over the whole set, each counted on the nodes the other
 * filters keep: the field's own restriction is lifted, so its other values
 * stay offered. The "none" bucket closes the list when a node has no value.
 * A choice is an entity: values without an IRI (an embedded point) are not
 * buckets.
 */
const countFacet = (
  rows: readonly FacetRow[],
  field: ListField,
  filters: readonly FacetFilter[],
): FacetCount => {
  const kept = rows.filter((row) =>
    matchesFilters(
      row,
      filters.filter((filter) => filter.field !== field.id),
    ),
  );
  const count = (value: string | null): number =>
    kept.filter((row) => holdsValue(row, field.id, value)).length;
  const labels = new Map(
    rows.flatMap((row) =>
      readRowValues(row, field.id)
        .filter((value) => field.type !== "choices" || value.uri !== null)
        .map((value): [string, string] => [readValueKey(value), value.text]),
    ),
  );
  const values: FacetValueCount[] = [...labels]
    .toSorted(([, a], [, b]) => compareTexts(a, b))
    .map(([value, label]) => ({ value, label, count: count(value) }));
  const none = rows.some((row) => readRowValues(row, field.id).length === 0);
  return {
    field: field.id,
    label: field.label,
    values: none
      ? [...values, { value: null, label: null, count: count(null) }]
      : values,
  };
};

const readSortText = (row: FacetRow, field: string): string | null =>
  readRowValues(row, field).at(0)?.text ?? null;

/** Orders by the sort field's first text, the nodes without one last, then by IRI. */
const compareRows =
  (sort: FacetSort | null | undefined) =>
  (a: FacetRow, b: FacetRow): number => {
    if (sort === null || sort === undefined) {
      return a.uri.localeCompare(b.uri);
    }
    const textA = readSortText(a, sort.field);
    const textB = readSortText(b, sort.field);
    if (textA === null || textB === null) {
      return (
        Number(textA === null) - Number(textB === null) ||
        a.uri.localeCompare(b.uri)
      );
    }
    const order = compareTexts(textA, textB);
    return (
      (sort.descending === true ? -order : order) || a.uri.localeCompare(b.uri)
    );
  };

/**
 * Whether a facet narrows the set: two buckets or more, and no more than
 * half as many as nodes, so a bucket holds two nodes on average. A field
 * nearly every node holds its own value of (the stations a line serves)
 * groups nothing.
 */
const groupsRows = (facet: FacetCount, size: number): boolean =>
  facet.values.length > 1 && facet.values.length * 2 <= size;

const assertField = (
  fields: readonly ListField[],
  id: string,
  allows: (field: ListField) => boolean,
  use: string,
): void => {
  if (!fields.some((field) => field.id === id && allows(field))) {
    throw new Error(`the list has no field "${id}" to ${use}`);
  }
};

/**
 * The nodes of a set that the filters keep, in the sort's order, with their
 * number and the facets of every facetable field that groups the set (two
 * buckets or more, "none" included, and at most half as many as nodes). A facet's counts lift its own filter
 * and keep the others, so each count is the size of the set that applying
 * the value would leave. Both providers serve `Query.facetedInstances`
 * through it.
 *
 * @param rows - The set's nodes with the values of the fields they are faceted and sorted by.
 * @param fields - The set's list fields; filters name facetable ones, a sort a sortable one.
 * @param filters - The applied filters, all of which a node must meet.
 * @param sort - The order; without it, the IRIs' order.
 * @returns The kept IRIs, their number and the facets.
 * @throws When a filter or the sort names a field the list cannot use so.
 */
export function selectFacetedInstances(
  rows: readonly FacetRow[],
  fields: readonly ListField[],
  filters: readonly FacetFilter[] = [],
  sort?: FacetSort | null,
): FacetedSelection {
  for (const filter of filters) {
    assertField(fields, filter.field, (field) => field.facetable, "filter by");
  }
  if (sort !== null && sort !== undefined) {
    assertField(fields, sort.field, (field) => field.enableSorting, "sort by");
  }
  const uris = rows
    .filter((row) => matchesFilters(row, filters))
    .toSorted(compareRows(sort))
    .map((row) => row.uri);
  const facets = fields
    .filter((field) => field.facetable)
    .map((field) => countFacet(rows, field, filters))
    .filter((facet) => groupsRows(facet, rows.length));
  return { uris, totalCount: uris.length, facets };
}
