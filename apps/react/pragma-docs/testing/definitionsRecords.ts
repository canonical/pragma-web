/**
 * The Definitions lens's captured stores, the one place the site's suites
 * reach them: the site's hydration, lens-switch and layout suites replay the
 * stores the lens package captured for its own tests, so the site renders
 * the lens over the same bytes the lens is tested against.
 *
 * This file crosses a package boundary on purpose, and is the only file that
 * does. The stores live in `@canonical/prism-lens-definitions`'s `testing/`
 * directory, which the package neither publishes nor exports: test fixtures
 * are no part of a package's public API. So the path below is relative to
 * this monorepo's layout and resolves nowhere else. A store that moves or is
 * renamed in the lens package fails this app's type check here, at the one
 * import to repoint, rather than in each suite. The alternative, a copy of
 * the stores in this app, would drift from the operation the lens compiles.
 */

export { default as definitionsExplorerRecords } from "../../../../packages/prism/lens-definitions/testing/records/definitionsExplorerRecords.js";
export { default as definitionsExplorerRecordsComponent } from "../../../../packages/prism/lens-definitions/testing/records/definitionsExplorerRecordsComponent.js";
export { default as definitionsExplorerRecordsProperty } from "../../../../packages/prism/lens-definitions/testing/records/definitionsExplorerRecordsProperty.js";
