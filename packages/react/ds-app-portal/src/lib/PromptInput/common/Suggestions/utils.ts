// Built from positions, as consumer ids may hold characters invalid in an id.
export const getOptionId = (
  listboxId: string,
  groupIndex: number,
  itemIndex: number,
): string => `${listboxId}-${groupIndex}-${itemIndex}`;
