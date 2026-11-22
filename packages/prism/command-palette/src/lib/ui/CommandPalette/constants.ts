import type { PaletteDestinations } from "../CommandPaletteJump/index.js";

/**
 * The letter that opens the palette, held with Cmd or Ctrl, as a keystroke's
 * `key` reads it in lower case.
 */
export const PALETTE_SHORTCUT_KEY = "k";

/** The destinations of a site that hands the palette none. */
export const NO_DESTINATIONS: PaletteDestinations = { places: [], recent: [] };
