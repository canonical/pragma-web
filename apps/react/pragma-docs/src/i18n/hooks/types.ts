import type { Translate } from "../types.js";

/** What `useMessages` takes: nothing, since it reads the context in scope. */
export type UseMessagesProps = Record<never, never>;

/** What `useMessages` returns: the translator in scope. */
export type UseMessagesResult = Translate;
