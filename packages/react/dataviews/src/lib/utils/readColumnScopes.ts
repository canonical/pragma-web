import type {
  Applicability,
  Collection,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { readApplicability } from "@canonical/dataviews-core/bindings";
import type { DisplayField } from "../common/index.js";
import readFieldName from "./readFieldName.js";

/** What one declared column or field knows of record types. */
export type ColumnScope = {
  /**
   * The types a table's heading names, or null where it applies to every
   * record: its own narrowing where it declares one, else its schema field's
   * scope.
   */
  readonly scopedTo: readonly string[] | null;
  /** Whether it applies to a record of the given declared type, or of none. */
  readonly applicability: (type: string | null) => Applicability;
};

/** One declared column's or field's scope, by the column or field. */
export type ColumnScopes = (column: DisplayField) => ColumnScope;

export type ReadColumnScopesConfig = {
  /** The collection whose declared types and scoped fields are read. */
  readonly collection: Pick<
    Collection<readonly SchemaFieldDefinition[]>,
    "schema" | "types"
  >;
  /** Every column or field the renderer declares, shown or not. */
  readonly columns: readonly DisplayField[];
};

/**
 * Read what each declared column — a table's column or a card's field —
 * knows of record types, checking every one that narrows its schema field's
 * scope as it goes.
 *
 * A column applies to its schema field's types unless it names fewer. Each
 * name it gives must be a type the collection declares and, where the field
 * is scoped, one the field applies to: a name that is neither would draw
 * every value not applicable and say nothing about why, so it fails here,
 * where the renderer mounts, and names the column. That check is what lets a
 * narrowed column decide a record by its own names alone — a type among them
 * is one its field applies to.
 *
 * The reader throws for a column outside the list, since a scope it did not
 * read is not one it can answer for.
 */
export default function readColumnScopes({
  collection,
  columns,
}: ReadColumnScopesConfig): ColumnScopes {
  const { schema, types } = collection;
  const scopes = new Map<string, ColumnScope>();
  for (const column of columns) {
    const field = readFieldName(column);
    const narrowing = column.appliesTo;
    if (narrowing === undefined) {
      scopes.set(column.id, {
        scopedTo: schema.findField(field)?.appliesTo ?? null,
        applicability: (type) => readApplicability(collection, field, type),
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
      applicability: (type) =>
        type !== null && within.has(type) ? "applies" : "not-applicable",
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
