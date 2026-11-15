/**
 * The checks every prism package and app runs over its own components: that
 * each anatomy is well formed, that each rendered identity keeps the slot
 * order, that each switch over a node's typename cases every arm its
 * fragment spreads, that each stylesheet transcribes its
 * anatomy, that each folder has the generator's shape and placement, that
 * each projected anatomy reads what its Relay fragment reads, and that the
 * stylesheets keep the design's token and grid rules.
 *
 * @experimental Test infrastructure for prism's own packages, published so
 * the lens packages and the apps can run the same checks; its options and
 * its findings may change with the anatomy DSL.
 *
 * @module
 */

export { default as assertAnatomy } from "./assertAnatomy.js";
export { default as assertProjectionMatchesFragment } from "./assertProjectionMatchesFragment.js";
export { default as assertScaffold } from "./assertScaffold.js";
export { default as assertStylesheets } from "./assertStylesheets.js";
export { default as assertStylesMatchAnatomy } from "./assertStylesMatchAnatomy.js";
export { default as expectSlotOrder } from "./expectSlotOrder.js";
export { default as expectSwitchCoverage } from "./expectSwitchCoverage.js";
export { default as guardTypedArms } from "./guardTypedArms.js";
export { default as listAnatomyFolders } from "./listAnatomyFolders.js";
export type {
  AssertScaffoldOptions,
  AssertStylesheetsOptions,
  ExpectSlotOrderOptions,
  GuardableMap,
  GuardableMaps,
  SwitchCoverageOptions,
  SwitchFragment,
  SwitchSelection,
} from "./types.js";
