/**
 * The package's string seam: one English catalog, the hook that reads the
 * translator in scope, and the component that renders a sentence wrapping
 * elements as one message.
 *
 * @module
 */

export { MESSAGES } from "./constants.js";
export { default as useMessages } from "./hooks/useMessages.js";
export type { MessageProps } from "./Message/index.js";
export { Message } from "./Message/index.js";
export type { MessageKey, MessageValues, Translate } from "./types.js";
