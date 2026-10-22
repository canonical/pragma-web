import type { ADMONITION_KINDS } from "./constants.js";

/** One of the five GitHub admonition kinds, lowercased. */
export type AdmonitionKind = (typeof ADMONITION_KINDS)[number];
