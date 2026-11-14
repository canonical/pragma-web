/**
 * Domain constants for the site lens.
 */

import type { TermVisibility } from "./types.js";

/** The {@link LangLiterals} key that holds the untagged literal. */
export const UNTAGGED = "";

/**
 * The visibility a lens gives a class whose instances are values, never
 * entities: no index, search or list may show them.
 */
export const HIDDEN_VISIBILITY: TermVisibility = "HIDDEN";
