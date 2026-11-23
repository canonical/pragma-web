import type { Deferred } from "./types.js";

/**
 * A promise and its settling functions, to answer a stand-in call on cue.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function createDeferred<T>(): Deferred<T> {
  return Promise.withResolvers<T>();
}
