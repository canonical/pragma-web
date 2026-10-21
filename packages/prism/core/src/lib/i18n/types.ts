import type { MESSAGES } from "./constants.js";

/** A key of the package's catalog. */
export type MessageKey = keyof typeof MESSAGES;

/** The values that fill a message's `{name}` placeholders, by name. */
export type MessageValues = Readonly<Record<string, string>>;
