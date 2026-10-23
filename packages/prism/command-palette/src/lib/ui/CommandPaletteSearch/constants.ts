/** How many results one search asks the graph for. */
export const SEARCH_PAGE_SIZE = 20;

/**
 * How far each arrow key moves the highlighted result through the listbox,
 * by the key's name: down to the next, up to the previous.
 */
export const ARROW_STEPS: ReadonlyMap<string, number> = new Map([
  ["ArrowDown", 1],
  ["ArrowUp", -1],
]);
