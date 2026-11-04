import type { MessageKey } from "../../i18n/index.js";
import type { EntityListRenderer } from "./types.js";

/** The renderers a list of entities draws its items with, by name. */
export const ENTITY_LIST_RENDERERS = ["table", "cards"] as const;

/** The renderer a list draws with when its consumer names none. */
export const DEFAULT_ENTITY_LIST_RENDERER: EntityListRenderer = "table";

/** How many intrinsic columns each card spans in the cards renderer. */
export const ENTITY_LIST_CARD_SPAN = 2;

/** The catalog key that labels each renderer on a switch. */
export const RENDERER_LABEL_KEYS: Readonly<
  Record<EntityListRenderer, MessageKey>
> = {
  table: "renderer.table",
  cards: "renderer.cards",
};
