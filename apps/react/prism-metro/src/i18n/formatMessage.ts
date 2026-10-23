import { MESSAGES } from "./constants.js";

/** A key of the app's catalog. */
type MessageKey = keyof typeof MESSAGES;

/**
 * Read a message of the app's catalog and fill in its values: each `{name}`
 * in the message becomes the value `values` gives `name`.
 *
 * @param key - The message's key.
 * @param values - The values its placeholders name.
 * @returns The message, filled in.
 * @throws When the message names a placeholder `values` does not give.
 */
export default function formatMessage(
  key: MessageKey,
  values: Readonly<Record<string, string | number>>,
): string {
  return MESSAGES[key].replaceAll(/\{(\w+)\}/g, (_, name: string) => {
    const value = values[name];
    if (value === undefined) {
      throw new Error(`message "${key}" needs a value for {${name}}`);
    }
    return String(value);
  });
}
