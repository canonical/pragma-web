import type {
  Applicability,
  Collection,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { readFieldName } from "../../../../utils/index.js";
import type { DataTableColumn } from "../../types.js";

/** What one column knows of record types. */
export type ColumnScope<TRow extends object> = {
  /**
   * The types the column's header names, or null where the column applies to
   * every record: the column's own narrowing where it declares one, else its
   * field's scope.
   */
  readonly scopedTo: readonly string[] | null;
  /** Whether the column applies to one record. */
  readonly applicability: (record: TRow) => Applicability;
};

/** One rendered column's scope, by the column. */
export type ColumnScopes<TRow extends object> = (
  column: DataTableColumn,
) => ColumnScope<TRow>;

export type ReadColumnScopesConfig<TRow extends object> = {
  readonly collection: Collection<readonly SchemaFieldDefinition[], TRow>;
  /** The provider's answer for a field and a record: the field's own scope. */
  readonly applicability: (field: string, record: TRow) => Applicability;
  /** The provider's name for a record's declared type, or null for none. */
  readonly typeOf: (record: TRow) => string | null;
  /** The columns the table renders. */
  readonly columns: readonly DataTableColumn[];
};

/**
 * Read what each rendered column knows of record types, checking every
 * column that narrows its field's scope as it goes.
 *
 * A column applies to its field's types unless it names fewer. Each name it
 * gives must be a type the collection declares and, where its field is
 * scoped, one the field applies to: a name that is neither would draw every
 * cell not applicable and say nothing about why, so it fails here, where the
 * table is mounted, and names the column. That check is what lets a
 * narrowed column decide a record by its own names alone — a type among
 * them is one its field applies to.
 *
 * The reader throws for a column outside the list, since a scope it did not
 * read is not one it can answer for.
 */
export default function readColumnScopes<TRow extends object>({
  collection,
  applicability,
  typeOf,
  columns,
}: ReadColumnScopesConfig<TRow>): ColumnScopes<TRow> {
  const { schema, types } = collection;
  const scopes = new Map<string, ColumnScope<TRow>>();
  for (const column of columns) {
    const field = readFieldName(column);
    const narrowing = column.appliesTo;
    if (narrowing === undefined) {
      scopes.set(column.id, {
        scopedTo: schema.findField(field)?.appliesTo ?? null,
        applicability: (record) => applicability(field, record),
      });
      continue;
    }
    if (types === null) {
      throw new Error(
        `column "${column.id}" applies to record types, but the collection declares none`,
      );
    }
    if (narrowing.length === 0) {
      throw new Error(`column "${column.id}" applies to no record type`);
    }
    const fieldScope = schema.findField(field)?.appliesTo;
    if (new Set(narrowing).size !== narrowing.length) {
      throw new Error(`column "${column.id}" names a record type twice`);
    }
    for (const name of narrowing) {
      if (!types.names.includes(name)) {
        throw new Error(
          `column "${column.id}" applies to "${name}", which is not a type of "${types.field}"`,
        );
      }
      if (fieldScope !== undefined && !fieldScope.includes(name)) {
        throw new Error(
          `column "${column.id}" applies to "${name}", which its field "${field}" does not`,
        );
      }
    }
    const within = new Set(narrowing);
    scopes.set(column.id, {
      scopedTo: narrowing,
      applicability: (record) => {
        const type = typeOf(record);
        return type !== null && within.has(type) ? "applies" : "not-applicable";
      },
    });
  }
  return (column) => {
    const scope = scopes.get(column.id);
    if (scope === undefined) {
      throw new Error(`column "${column.id}" is not one the table renders`);
    }
    return scope;
  };
}
