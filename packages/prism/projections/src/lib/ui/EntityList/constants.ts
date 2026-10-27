/** The two views of a list of entities, in the order the toggle offers them. */
export const ENTITY_LIST_VIEWS = ["cards", "rows"] as const;

/** The view a list renders when its consumer names none. */
export const DEFAULT_ENTITY_LIST_VIEW = "cards";

/** How many intrinsic columns each card spans in the cards view. */
export const ENTITY_LIST_CARD_SPAN = 2;

/** The catalog key of each view's toggle. */
export const VIEW_MESSAGES = {
  cards: "list.view.cards",
  rows: "list.view.rows",
} as const;
