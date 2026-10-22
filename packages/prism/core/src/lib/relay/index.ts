/**
 * The Relay plumbing a Prism site shares: the environment factory, the
 * prefetch slot route `warm` hooks fetch into, and the server's data
 * prepare step.
 *
 * @module
 */

export { default as createEnvironment } from "./createEnvironment.js";
export {
  getPrefetchEnvironment,
  setPrefetchEnvironment,
} from "./prefetchEnvironment.js";
export { default as prefetchQuery } from "./prefetchQuery.js";
export { default as prepareRelayData } from "./prepareRelayData.js";
export type {
  CreateEnvironmentOptions,
  PreparedRelayData,
  PrepareRelayDataOptions,
} from "./types.js";
