/**
 * The DOM id of a row. Built from positions rather than the consumer's ids,
 * which may hold characters an id attribute cannot.
 */
export const getOptionId = (
  listboxId: string,
  groupIndex: number,
  itemIndex: number,
): string => `${listboxId}-${groupIndex}-${itemIndex}`;
