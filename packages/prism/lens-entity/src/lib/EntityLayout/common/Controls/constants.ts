import type { MessageKey } from "../../../i18n/index.js";
import type { EntityView } from "../../../types.js";

/** The catalog key of each view's toggle. */
export const VIEW_MESSAGES: Readonly<Record<EntityView, MessageKey>> = {
  rows: "controls.view.rows",
  cards: "controls.view.cards",
};
