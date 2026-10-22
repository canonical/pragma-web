import { useContext } from "react";
import MessagesContext from "../Context.js";
import type { UseMessagesResult } from "./types.js";

/**
 * Read the translator in scope: the one a locale-aware layer provides, or
 * the English catalog's by default. Call it at the top of a component and
 * read every string a reader sees through the function it returns.
 *
 * @note Impure: reads the messages context in scope, so the translator it
 *   returns changes whenever the nearest provider's catalog does.
 * @returns The translator: a key and its placeholder values in, the message
 *   out. A placeholder with no value stays verbatim, so a missing value never
 *   breaks a render.
 */
export default function useMessages(): UseMessagesResult {
  return useContext(MessagesContext);
}
