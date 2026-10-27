import type { MESSAGES } from "./constants.js";

/** A key of the app's catalog. */
export type MessageKey = keyof typeof MESSAGES;

/**
 * The values that fill a message's `{name}` placeholders, by name; `count`
 * also selects a plural record's branch.
 */
export type MessageValues = Readonly<Record<string, string | number>>;

/**
 * A translator over the app's catalog: a key and its placeholder values in,
 * the message out.
 */
export type Translate = (key: MessageKey, values?: MessageValues) => string;
