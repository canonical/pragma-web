import { SLOT_ORDER } from "./constants.js";

/**
 * Assert that an entity's rendered identity follows the slot order every
 * representation shares (mark, prefix, title, address, kind, summary,
 * facts, status): the slots it renders are a subsequence of that order,
 * never a reordering, and its mark, when it has one, leads its title.
 *
 * A slot is an element whose class names one of the eight slots. A slot
 * rendered inside another (a card's mark at the start of its title
 * heading) is read where it begins: an element that holds another slot is
 * left out of the order and the slots it holds stand for it, so the mark
 * inside a title still precedes the title's text.
 *
 * @param root - The rendered representation: its root element or any
 *   ancestor of the slots.
 * @throws When two slots are out of order, or the mark follows the title.
 */
export default function expectSlotOrder(root: Element): void {
  const selector = SLOT_ORDER.map((slot) => `.${slot}`).join(", ");
  const slots = [...root.querySelectorAll(selector)];
  const leaves = slots.filter(
    (slot) => !slots.some((other) => other !== slot && slot.contains(other)),
  );
  const ranks = leaves.map((slot) => rankSlot(slot));
  ranks.forEach((rank, index) => {
    const previous = ranks.at(index - 1);
    if (index > 0 && previous !== undefined && rank < previous) {
      throw new Error(
        `slot "${SLOT_ORDER.at(rank)}" follows "${SLOT_ORDER.at(previous)}": the order is ${SLOT_ORDER.join(", ")}`,
      );
    }
  });
  const mark = root.querySelector(".mark");
  const title = root.querySelector(".title");
  if (mark !== null && title !== null && !title.contains(mark)) {
    const following = mark.compareDocumentPosition(title);
    if ((following & Node.DOCUMENT_POSITION_FOLLOWING) === 0) {
      throw new Error("the mark does not lead the title");
    }
  }
}

/** The slot an element's class names, as its index in the slot order. */
function rankSlot(element: Element): number {
  const rank = SLOT_ORDER.findIndex((slot) =>
    element.classList.contains(slot),
  );
  if (rank < 0) {
    throw new Error(`${element.className} names no slot`);
  }
  return rank;
}
