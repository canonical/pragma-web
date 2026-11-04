import type {
  PredicateOperand,
  PredicateOperator,
} from "@canonical/dataviews-core";
import type { ProviderHost } from "@canonical/dataviews-core/bindings";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The field the conjunct restricts. */
  readonly field: string;
  /** The operator it restricts the field under. */
  readonly operator: PredicateOperator;
  /** Its place among the conjuncts at the address, which a removal names. */
  readonly nth: number;
  /**
   * Its place among the further conjuncts, from 1: the ordinal its hidden
   * inputs are named with, never the control's own.
   */
  readonly ordinal: number;
  /** The values it holds, canonical. */
  readonly operands: readonly PredicateOperand[];
  /** How the control above it reads, which the row reads as too. */
  readonly phrase: string;
  /** The provider's host, which removes the conjunct and spells where that leads. */
  readonly host: Pick<ProviderHost, "state" | "spellQuery" | "removePredicate">;
  /** Move focus to the filters' group, where the row's Clear hands it. */
  readonly onLeave: () => void;
};

/**
 * Props of one further conjunct's row: its own, and the native props of
 * the `li` it renders as its root.
 */
export type FurtherConjunctProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
