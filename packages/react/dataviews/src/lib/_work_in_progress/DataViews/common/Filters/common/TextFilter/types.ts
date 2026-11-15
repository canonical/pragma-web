import type {
  FieldKindOperators,
  FilterHandle,
} from "@canonical/dataviews-core";
import type { ProviderHost } from "@canonical/dataviews-core/bindings";
import type { ComponentProps } from "react";

/** An operator a text field filters by. */
export type TextFilterOperator = FieldKindOperators["text"];

type OwnProps = {
  /**
   * The operator a conjunct stands under, which this control edits, or null
   * for the control offered while none stands on the field.
   */
  readonly standing: TextFilterOperator | null;
  /**
   * The operators the source declares on the field, in the kind's order, as
   * `listOfferedOperators` lists them. A conjunct standing under another is
   * offered only while it stands, and only for removal.
   */
  readonly offered: readonly TextFilterOperator[];
  /** The operators the field's other controls edit, which this one cannot take. */
  readonly taken: readonly TextFilterOperator[];
  /** The root's handle for the text the field must match under an operator. */
  readonly findHandle: (operator: TextFilterOperator) => FilterHandle<string>;
  /** The field's visible name; the operator's wording is added to it. */
  readonly label: string;
  /** The field the control addresses, which names its input. */
  readonly field: string;
  /** The provider's host, which moves standing text to another operator. */
  readonly host: ProviderHost;
  /**
   * Whether focus goes to the parent once the text the control clears is
   * gone: the control is about to leave, or another takes its place, rather
   * than stay where focus could return to it.
   */
  readonly leavesWhenCleared: boolean;
  /**
   * Place focus when the control leaves with the text it removed: the
   * parent owns where it goes.
   */
  readonly onLeave: () => void;
  /**
   * Hear that standing text is moving to another operator, before it
   * moves: the move may place it in another of the field's controls.
   */
  readonly onMoved: (operator: TextFilterOperator) => void;
  /**
   * Whether text just moved to this operator, once: the control now
   * standing under it takes the focus the choice had.
   */
  readonly takeMoved: (operator: TextFilterOperator) => boolean;
};

/**
 * Props of one text filter: its own, and the native props of the
 * `div` it renders as its root.
 */
export type TextFilterProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
