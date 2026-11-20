import {
  EMPTY_SLICE,
  type PredicateOperand,
  type Slice,
} from "../src/lib/query/index.js";

/** A slice filtering `status` to these operands and nothing else. */
export default function filterStatusBy(
  operands: readonly PredicateOperand[],
): Slice {
  return {
    ...EMPTY_SLICE,
    filter: [{ field: "status", operator: "isAny", operands }],
  };
}
