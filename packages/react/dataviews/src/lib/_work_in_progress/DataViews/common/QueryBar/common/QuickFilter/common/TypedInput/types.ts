import type {
  PredicateOperator,
  SchemaFieldDefinition,
  SourceRefusal,
} from "@canonical/dataviews-core";
import type { PlacedConjunct, QueryGroupStandIn } from "../../../../types.js";

/**
 * The props of one typed value of a quick filter's panel. Exempt from the
 * native-prop extension: a private part of the panels, whose root takes
 * only what a panel hands it.
 */
export type TypedInputProps = {
  readonly definition: Extract<
    SchemaFieldDefinition,
    { readonly kind: "number" | "date" | "text" }
  >;
  /** The address the value applies at, with the field's. */
  readonly operator: PredicateOperator;
  /** The input's label. */
  readonly label: string;
  /** The field's first conjunct at the address, if one stands. */
  readonly standing: PlacedConjunct | undefined;
  /** The id of a hint the input is described by, if any. */
  readonly hintId?: string | undefined;
  readonly group: QueryGroupStandIn;
  /** Whether the input carries the name the wire spells its clause by. */
  readonly named: boolean;
  /**
   * Hear a commit's outcome: the refusals of the query it asked for, empty
   * when it applied.
   */
  readonly onCommit: (refusals: readonly SourceRefusal[]) => void;
  /** Say why a typed value cannot apply. */
  readonly onInvalid: (message: string) => void;
};
