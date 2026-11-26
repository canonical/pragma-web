import { useReducer } from "react";
import type { WalkAction, WalkState } from "../types.js";
import type { UseWalkResult } from "./types.js";

/** The walk closed, nothing chosen. */
const CLOSED: WalkState = {
  step: "closed",
  field: null,
  operator: null,
  operands: [],
  typed: "",
  invalid: null,
};

/**
 * The walk's steps, as one reducer: opening starts at the field, each
 * choice moves on, a field or an operator chosen again keeps what follows
 * only while it is the same, values toggle, and Back returns a step,
 * leaving from the first. Leaving drops everything chosen. Pure.
 *
 * @param walk - Where the walk stands.
 * @param action - What happened.
 * @returns Where it stands next.
 */
const reduceWalk = (walk: WalkState, action: WalkAction): WalkState => {
  switch (action.type) {
    case "open":
      return { ...CLOSED, step: "field" };
    case "chooseField":
      return action.field === walk.field
        ? { ...walk, step: "operator" }
        : { ...CLOSED, step: "operator", field: action.field };
    case "chooseOperator":
      return action.operator === walk.operator
        ? { ...walk, step: "value" }
        : {
            ...walk,
            step: "value",
            operator: action.operator,
            operands: [],
            typed: "",
            invalid: null,
          };
    case "toggleValue": {
      const held = walk.operands.some((operand) =>
        Object.is(operand, action.operand),
      );
      return {
        ...walk,
        invalid: null,
        operands: held
          ? walk.operands.filter(
              (operand) => !Object.is(operand, action.operand),
            )
          : [...walk.operands, action.operand],
      };
    }
    case "type":
      return { ...walk, typed: action.text, invalid: null };
    case "invalid":
      return { ...walk, invalid: action.reason };
    case "back":
      return walk.step === "value"
        ? { ...walk, step: "operator", invalid: null }
        : walk.step === "operator"
          ? { ...walk, step: "field" }
          : CLOSED;
    case "leave":
      return CLOSED;
  }
};

/**
 * Where "Add filter" stands, and how it moves: closed, then the field,
 * the operator and the value steps. It holds only what the walk has
 * chosen; the filter applies when it is added, never before.
 *
 * @returns The walk and its dispatch.
 */
export default function useWalk(): UseWalkResult {
  const [walk, dispatch] = useReducer(reduceWalk, CLOSED);
  return { walk, dispatch };
}
