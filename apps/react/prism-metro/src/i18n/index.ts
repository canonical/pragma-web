/**
 * The app's string seam: its English catalog, and the hook that reads the
 * translator in scope.
 *
 * @module
 */

export { LOCALE, MESSAGES } from "./constants.js";
export { default as useMessages } from "./hooks/useMessages.js";
export type { MessageKey, MessageValues, Translate } from "./types.js";
