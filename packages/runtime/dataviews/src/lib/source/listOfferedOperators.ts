import {
  type FieldKindOperators,
  resolveFieldKind,
  type SchemaFieldDefinition,
} from "../schema/index.js";
import type { SourceCapabilities } from "./types.js";

/**
 * The operators a control may offer on one field: those its kind accepts
 * that the source declares it can execute on the field, in the kind's
 * order, typed by the definition's kind. Empty when the source declares
 * none. The one answer every control lists a field's operators by, so no
 * two disagree.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function listOfferedOperators<
  TDefinition extends SchemaFieldDefinition,
>(
  definition: TDefinition,
  capabilities: SourceCapabilities,
): readonly FieldKindOperators[TDefinition["kind"]][] {
  // Own keys only: a field named after a prototype member declares nothing.
  const declared = Object.hasOwn(capabilities.filter, definition.field)
    ? capabilities.filter[definition.field]
    : undefined;
  if (declared === undefined) {
    return [];
  }
  // The table's row for this kind lists this kind's operators.
  const operators = resolveFieldKind(definition.kind)
    .operators as readonly FieldKindOperators[TDefinition["kind"]][];
  return operators.filter((operator) => declared.includes(operator));
}
