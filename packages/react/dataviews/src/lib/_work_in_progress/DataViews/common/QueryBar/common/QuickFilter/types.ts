import type {
  FieldKind,
  PredicateCondition,
  PredicateEdit,
  PredicateOperand,
  SchemaFieldDefinition,
  SourceRefusal,
} from "@canonical/dataviews-core";
import type { PlacedConjunct, QueryGroupStandIn } from "../../types.js";

/**
 * How a quick filter shows its field: its values as words beside its name,
 * or a filter button opening a panel of controls. Public as
 * `DataViewsQueryBarQuickFilterArrangement`.
 */
export type QuickFilterArrangement = "words" | "button";

/**
 * One word of a quick filter: what it shows, whether the query holds its
 * condition, and the edit choosing it makes. Derived from the query state
 * on every read and never stored.
 */
export type QuickFilterWord = {
  /** The value the word stands for; null for "All". */
  readonly value: PredicateOperand | null;
  readonly label: string;
  readonly current: boolean;
  /** Whether a none-of set of the field holds the value. */
  readonly excluded: boolean;
  /** The edit choosing the word makes; null where it would change nothing. */
  readonly edit: PredicateEdit | null;
};

/** A quick filter's applied values: how many, and the condition they share. */
export type QuickFilterApplied = {
  readonly count: number;
  /** The condition every applied conjunct asserts; absent where they differ. */
  readonly condition?: PredicateCondition | undefined;
};

/**
 * What every panel of a quick filter's button is drawn from: its field,
 * the field's conjuncts as the quick filter reads them, the query group it
 * commits to, and whether its controls carry the wire's names for a form.
 * Exempt from the native-prop extension: a private part of the quick
 * filter, whose root takes only what the quick filter hands it.
 */
export type QuickFilterPanelProps<TKind extends FieldKind> = {
  readonly definition: Extract<SchemaFieldDefinition, { readonly kind: TKind }>;
  /** The field's label. */
  readonly label: string;
  /** The field's conjuncts, each with its place. */
  readonly conjuncts: readonly PlacedConjunct[];
  readonly group: QueryGroupStandIn;
  /** Whether each control carries the name the wire spells its clause by. */
  readonly named: boolean;
  /**
   * Hear a commit's outcome: the refusals of the query it asked for, empty
   * when it applied.
   */
  readonly onCommit: (refusals: readonly SourceRefusal[]) => void;
  /** Say why a typed value cannot apply. */
  readonly onInvalid: (message: string) => void;
};
