/**
 * The app's own string seam: one English catalog, and the hook that reads
 * the translator in scope over it.
 *
 * @module
 */

export { MESSAGES } from "./constants.js";
export { default as useMessages } from "./hooks/useMessages.js";
export type { MessageKey, MessageValues, Translate } from "./types.js";
