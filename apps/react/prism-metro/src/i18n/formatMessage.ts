import { MESSAGES } from "./constants.js";

/**
 * Read a message of the app's catalog with its placeholders filled: each
 * `{name}` in the message is replaced by the value given for it.
 *
 * @param key - The message's key in the catalog.
 * @param values - The value of each placeholder the message names.
 * @returns The message, filled.
 */
export default function formatMessage(
  key: keyof typeof MESSAGES,
  values: Readonly<Record<string, string | number>>,
): string {
  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    MESSAGES[key] as string,
  );
}
