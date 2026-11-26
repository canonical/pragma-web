import type {
  PredicateOperand,
  PredicateOperator,
} from "@canonical/dataviews-core";
import type { UseAnnounceOutcomeResult } from "../../../../hooks/index.js";
import type { QueryGroupStandIn } from "../../../../types.js";

/** A step of "Add filter", or none while the walk is closed. */
export type WalkStep = "closed" | "field" | "operator" | "value";

/**
 * Where "Add filter" stands: its step, and what has been chosen so far,
 * kept as the walk goes back so a step shows what was chosen there.
 */
export type WalkState = {
  readonly step: WalkStep;
  /** The field chosen, or null before one is. */
  readonly field: string | null;
  /** The operator chosen, or null before one is. */
  readonly operator: PredicateOperator | null;
  /** The values chosen so far. */
  readonly operands: readonly PredicateOperand[];
  /** What is typed for a typed value. */
  readonly typed: string;
  /** Why the value cannot apply, once Add tried it. */
  readonly invalid: string | null;
};

/** Everything that moves the walk. */
export type WalkAction =
  | { readonly type: "open" }
  | { readonly type: "chooseField"; readonly field: string }
  | { readonly type: "chooseOperator"; readonly operator: PredicateOperator }
  | { readonly type: "toggleValue"; readonly operand: PredicateOperand }
  | { readonly type: "type"; readonly text: string }
  | { readonly type: "invalid"; readonly reason: string }
  | { readonly type: "back" }
  | { readonly type: "leave" };

/** Props of the sheet's "Add filter" walk. */
export type AddFilterWalkProps = {
  /** The query group the filter is added to. */
  readonly group: QueryGroupStandIn;
  /** Says the clause added, with the count once the result lands. */
  readonly announceOutcome: UseAnnounceOutcomeResult;
  /** Called with the id of the chip the filter added became. */
  readonly onAdded: (clauseId: string) => void;
};
