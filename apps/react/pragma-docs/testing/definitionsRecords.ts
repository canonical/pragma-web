/**
 * The Definitions lens's captured stores, the one place the site's suites
 * reach them: the site's hydration, lens-switch and layout suites replay the
 * stores the lens package captured for its own tests, so the site renders
 * the lens over the same bytes the lens is tested against.
 */

export { default as definitionsExplorerRecords } from "../../../../packages/prism/lens-definitions/testing/records/definitionsExplorerRecords.js";
export { default as definitionsExplorerRecordsComponent } from "../../../../packages/prism/lens-definitions/testing/records/definitionsExplorerRecordsComponent.js";
export { default as definitionsExplorerRecordsProperty } from "../../../../packages/prism/lens-definitions/testing/records/definitionsExplorerRecordsProperty.js";
