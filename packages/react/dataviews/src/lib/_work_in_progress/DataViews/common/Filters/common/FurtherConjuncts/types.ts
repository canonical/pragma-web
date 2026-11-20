import type {
  FilterHandle,
  PredicateOperator,
} from "@canonical/dataviews-core";
import type { ProviderHost } from "@canonical/dataviews-core/bindings";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The control's handle, whose further conjuncts the list shows. */
  readonly handle: Pick<FilterHandle<unknown>, "others">;
  /** The field the control addresses. */
  readonly field: string;
  /** The operator the control addresses. */
  readonly operator: PredicateOperator;
  /** The field's visible name, which the control's phrase is worded with. */
  readonly label: string;
  /** The provider's host, which removes a conjunct and spells where that leads. */
  readonly host: Pick<ProviderHost, "state" | "spellQuery" | "removePredicate">;
  /** Move focus to the filters' group, where a cleared row hands it. */
  readonly onLeave: () => void;
};

/**
 * Props of the further conjuncts under one filter control: its own, and
 * the native props of the `ul` it renders as its root.
 */
export type FurtherConjunctsProps = OwnProps &
  Omit<ComponentProps<"ul">, keyof OwnProps | "children">;
