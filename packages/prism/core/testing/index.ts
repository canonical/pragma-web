/**
 * The checks every prism package and app runs over its own components: that
 * each anatomy is well formed, that each stylesheet transcribes its
 * anatomy, that each folder has the generator's shape and placement, and
 * that the stylesheets keep the design's token and grid rules.
 *
 * @experimental Test infrastructure for prism's own packages, published so
 * the lens packages and the apps can run the same checks; its options and
 * its findings may change with the anatomy DSL.
 *
 * @module
 */

export { default as assertAnatomy } from "./assertAnatomy.js";
export { default as assertScaffold } from "./assertScaffold.js";
export { default as assertStylesheets } from "./assertStylesheets.js";
export { default as assertStylesMatchAnatomy } from "./assertStylesMatchAnatomy.js";
export { default as listAnatomyFolders } from "./listAnatomyFolders.js";
export type {
  AssertScaffoldOptions,
  AssertStylesheetsOptions,
} from "./types.js";
