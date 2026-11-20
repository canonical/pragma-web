import type { SavedView } from "@canonical/dataviews-core";

/**
 * One stored view as a store lists it — first revision, unpinned, stamped
 * at a fixed instant — with any field overridden. The same builder, by the
 * same name, as the core package's testing fixtures.
 */
export default function buildStoredView(
  overrides: Partial<SavedView> = {},
): SavedView {
  return {
    id: "v1",
    name: "Failed",
    query: "status=failed",
    presentation: {},
    revision: 1,
    pinned: false,
    createdAt: "2026-09-11T00:00:00.000Z",
    updatedAt: "2026-09-11T00:00:00.000Z",
    ...overrides,
  };
}
