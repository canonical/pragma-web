import type { Deferred } from "./types.js";

/** A promise and its settling functions, to answer a stand-in call on cue. */
export default function createDeferred<T>(): Deferred<T> {
  return Promise.withResolvers<T>();
}
