import type { SavedView } from "../src/lib/views/index.js";

/** One stored view, as a store would list it, with the given fields changed. */
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
