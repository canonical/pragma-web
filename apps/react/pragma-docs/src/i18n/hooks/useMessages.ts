import { useContext } from "react";
import MessagesContext from "../Context.js";
import type { UseMessagesResult } from "./types.js";

/**
 * Read the translator in scope: the one a locale-aware layer provides, or
 * the English catalog's by default. Call it at the top of a component and
 * read every string a reader sees through the function it returns.
 *
 * `import { useMessages } from "#i18n";`
 *
 * @returns The translator: a key and its placeholder values in, the message
 *   out. A placeholder with no value stays verbatim, so a missing value never
 *   breaks a render.
 * @note Impure: reads the translator context in scope.
 */
export default function useMessages(): UseMessagesResult {
  return useContext(MessagesContext);
}
