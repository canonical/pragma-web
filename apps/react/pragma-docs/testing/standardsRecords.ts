/**
 * The Standards lens's captured stores and the reading exemplar they serve,
 * the one place the site's suites reach them: the site's hydration,
 * lens-switch and layout suites replay the stores the lens package captured
 * for its own tests, so the site renders the lens over the same bytes the
 * lens is tested against.
 *
 * This file crosses a package boundary on purpose, as
 * `definitionsRecords.ts` does for the Definitions lens. The stores live in
 * `@canonical/prism-lens-standards`'s `testing/` directory, which the
 * package neither publishes nor exports: test fixtures are no part of a
 * package's public API. So the paths below are relative to this monorepo's
 * layout and resolve nowhere else. A store that moves or is renamed in the
 * lens package fails this app's type check here, at the one import to
 * repoint, rather than in each suite.
 */

export { LINK_COMPONENT_URI } from "../../../../packages/prism/lens-standards/testing/fixtures.js";
export { default as standardEntityRecords } from "../../../../packages/prism/lens-standards/testing/records/standardEntityRecords.js";
export { default as standardsIndexRecords } from "../../../../packages/prism/lens-standards/testing/records/standardsIndexRecords.js";
