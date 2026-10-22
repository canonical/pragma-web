import type { HomeNode } from "../types.js";

/** The argument `useHome` takes: the node whose home to resolve. */
export type UseHomeProps = HomeNode;

/** What `useHome` returns: the node's href, or `undefined` when it has none. */
export type UseHomeResult = string | undefined;
