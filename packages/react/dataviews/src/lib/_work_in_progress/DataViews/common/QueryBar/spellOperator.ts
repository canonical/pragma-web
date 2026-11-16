import type {
  DataViewsMessages,
  PredicateOperand,
  PredicateOperator,
} from "@canonical/dataviews-core";

/**
 * An operator's words as a chip shows and speaks them, from the messages
 * record keyed by operator and nowhere else: the symbol or words shown,
 * such as `≥`, and the words spoken, such as "at least", each read from
 * the operands. Pure.
 *
 * @param operator - The operator.
 * @param operands - Its operands, which can change its words.
 * @param messages - The root's messages.
 * @returns What the chip shows and what it speaks.
 */
export default function spellOperator(
  operator: PredicateOperator,
  operands: readonly PredicateOperand[],
  messages: Pick<DataViewsMessages, "operatorShown" | "operatorSpoken">,
): { readonly shown: string; readonly spoken: string } {
  return {
    shown: messages.operatorShown(operator, operands),
    spoken: messages.operatorSpoken(operator, operands),
  };
}
