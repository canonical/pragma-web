import { MESSAGES } from "./constants.js";
import type { MessageKey, MessageValues } from "./types.js";

/**
 * Read a message from the package's catalog, filling each `{name}`
 * placeholder from `values`. Every string the package's components show a
 * reader goes through here, so a locale-aware catalog can replace this one
 * function without touching a component.
 *
 * @param key - The message to read.
 * @param values - The placeholder values, by name.
 * @returns The message with its placeholders filled.
 * @throws When the message names a placeholder `values` does not supply.
 */
export const t = (key: MessageKey, values: MessageValues = {}): string =>
  MESSAGES[key].replace(/\{(\w+)\}/g, (_placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) {
      throw new Error(`t: message "${key}" needs a value for {${name}}`);
    }
    return value;
  });
