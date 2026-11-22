import {
  DATE_RANGES,
  FLAG_RANGE,
  HIDDEN_VISIBILITY,
  NUMBER_RANGES,
  PROMINENT_VISIBILITY,
  UNLISTED_ROLES,
} from "./constants.js";
import type {
  DisplayField,
  ListField,
  ListFields,
  ListFieldType,
  ServedClassField,
} from "./types.js";

/** How a list reads a field's values, from its property's kind and range. */
const readFieldType = (served: ServedClassField): ListFieldType => {
  if (served.property.kind === "OBJECT") return "choices";
  if (served.property.kind === "ANNOTATION") return "text";
  if (NUMBER_RANGES.has(served.property.range)) return "number";
  if (DATE_RANGES.has(served.property.range)) return "date";
  if (served.property.range === FLAG_RANGE) return "flag";
  return "text";
};

/**
 * A position as a sort key: the missing ones after every declared one. Two
 * missing positions differ by `NaN`, which the comparators below read as a
 * tie.
 */
const readPosition = (position: number | null): number =>
  position ?? Number.POSITIVE_INFINITY;

/** The lens's order: by group, then by the field's order, then by name. */
const compareServedFields = (
  a: ServedClassField,
  b: ServedClassField,
): number =>
  readPosition(a.group?.order ?? null) - readPosition(b.group?.order ?? null) ||
  readPosition(a.order) - readPosition(b.order) ||
  a.name.localeCompare(b.name);

/** One served field as a list field. */
const toListField = (served: ServedClassField): ListField => {
  const type = readFieldType(served);
  return {
    id: served.name,
    property: served.property.uri,
    type,
    label: served.property.label ?? served.name,
    group: served.group?.uri ?? null,
    role: served.role,
    prominent: served.visibility === PROMINENT_VISIBILITY,
    enableSorting: served.singular && type !== "choices",
    facetable: type === "choices" || type === "flag",
  };
};

/** Whether a list shows the field as a fact: the row says the others. */
const isDisplayed = (field: ListField): boolean =>
  field.role === null || !UNLISTED_ROLES.has(field.role);

/**
 * A class's list fields, derived from the fields its provider serves with
 * their lens: what a list can show, sort and filter by, and the facts it
 * shows. Hidden fields are dropped; the rest keep the lens's order (by
 * group, then by field order, the unordered last, then by name). A field is
 * sortable when it holds one value that is not an entity, and facetable when
 * its values are entities or a flag. The facts are the fields that play no
 * role but classification, the prominent ones first.
 *
 * @param served - The class's fields as `OntologyClass.properties` serves them.
 * @returns The list fields and the displayed ones, in the lens's order.
 */
export function deriveListFields(
  served: readonly ServedClassField[],
): ListFields {
  const fields = served
    .filter((field) => field.visibility !== HIDDEN_VISIBILITY)
    .toSorted(compareServedFields)
    .map(toListField);
  const display: readonly DisplayField[] = fields
    .filter(isDisplayed)
    .toSorted((a, b) => Number(b.prominent) - Number(a.prominent))
    .map((field) => ({ field: field.id, header: field.label }));
  return { fields, display };
}
