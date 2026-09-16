import type { Applicability, ReadonlyChannel } from "@canonical/dataviews-core";

/**
 * The value installed per rendered cell by the table renderer: the
 * collection the cell's provider was built over, stable row and column
 * identifiers, and the cell's observable channels. The channels are
 * read-only: a cell scope is a projection, not another place to publish
 * from.
 *
 * The collection is held as what its one consumer uses it for — a witness
 * compared by reference, never read. Typing it as a collection would fix a
 * record type the table cannot know, and every table would cast its own
 * collection to satisfy it.
 */
export type CellContextValue = {
  readonly collection: object;
  readonly rowId: string;
  readonly columnId: string;
  readonly record: ReadonlyChannel<unknown>;
  readonly fields: Readonly<Record<string, ReadonlyChannel<unknown>>>;
  readonly selected: ReadonlyChannel<boolean>;
  /**
   * Whether this cell's field applies to the record in its row. A field
   * scoped to other record types is not empty: it is a third state, and a
   * renderer says so rather than leaving the same silence a missing value
   * leaves. Always "applies" where the collection declares one record type.
   */
  readonly applicability: Applicability;
};
