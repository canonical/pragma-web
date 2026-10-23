/**
 * The prose domain's barrel: binding Markdown sidecars to graph entities,
 * the schema extension that serves them, and the request's locale.
 *
 * @module prose
 */

export { bindProseSidecars } from "./bindProseSidecars.js";
export { createProseExtensions } from "./createProseExtensions.js";
export { readRequestLocale } from "./readRequestLocale.js";
export type {
  ProseBinding,
  ProseDocument,
  ProseIndex,
} from "./types.js";
