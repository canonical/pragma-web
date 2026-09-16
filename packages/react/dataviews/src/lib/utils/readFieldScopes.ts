import type { Applicability } from "@canonical/dataviews-core";
import { readApplicability } from "@canonical/dataviews-core/bindings";
import readFieldName from "./readFieldName.js";
import type {
  FieldScope,
  FieldScopes,
  ReadFieldScopesConfig,
} from "./types.js";

/** What each renderer calls one of the things it declares. */
const NOUNS = { DataTable: "column", Cards: "field" } as const;

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
export default function readFieldScopes({
  collection,
  fields,
  renderer,
}: ReadFieldScopesConfig): FieldScopes {
  const { schema, types } = collection;
  const subject = `${renderer} ${NOUNS[renderer]}`;
  const scopes = new Map<string, FieldScope>();
  for (const column of fields) {
    const field = readFieldName(column);
    const narrowing = column.appliesTo;
    if (narrowing === undefined) {
      const answers = new Map<string | null, Applicability>();
      scopes.set(column.id, {
        scope: schema.findField(field)?.appliesTo ?? null,
        // Read once per type the column is asked about — at most every
        // declared type and none — rather than once per cell.
        applicability: (type) => {
          const known = answers.get(type);
          if (known !== undefined) {
            return known;
          }
          const answer = readApplicability(collection, field, type);
          answers.set(type, answer);
          return answer;
        },
      });
      continue;
    }
    if (types === null) {
      throw new Error(
        `${subject} "${column.id}" applies to record types, but the collection declares none`,
      );
    }
    if (narrowing.length === 0) {
      throw new Error(`${subject} "${column.id}" applies to no record type`);
    }
    const fieldScope = schema.findField(field)?.appliesTo;
    if (new Set(narrowing).size !== narrowing.length) {
      throw new Error(`${subject} "${column.id}" names a record type twice`);
    }
    for (const name of narrowing) {
      if (!types.names.includes(name)) {
        throw new Error(
          `${subject} "${column.id}" applies to "${name}", which is not a type of "${types.field}"`,
        );
      }
      if (fieldScope !== undefined && !fieldScope.includes(name)) {
        throw new Error(
          `${subject} "${column.id}" applies to "${name}", which its field "${field}" does not`,
        );
      }
    }
    const within = new Set(narrowing);
    scopes.set(column.id, {
      scope: narrowing,
      applicability: (type) =>
        type !== null && within.has(type) ? "applies" : "not-applicable",
    });
  }
  return (column) => {
    const scope = scopes.get(column.id);
    if (scope === undefined) {
      throw new Error(
        `${subject} "${column.id}" is not one its scopes were read for`,
      );
    }
    return scope;
  };
}
