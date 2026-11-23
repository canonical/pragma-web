import type { ViewStore } from "../src/lib/views/index.js";

/** A store call a test did not expect. */
const refuse = (): Promise<never> =>
  Promise.reject(new Error("not used in this test"));

/**
 * Create a view store that answers as a test says: every call not
 * overridden lists nothing, finds nothing, refuses to write and hears nobody.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function createStandInViewStore(
  overrides: Partial<ViewStore> = {},
): ViewStore {
  return {
    list: async () => ({ views: [], unreadable: [] }),
    get: async () => ({ status: "missing" }),
    create: refuse,
    update: async () => ({ status: "missing" }),
    remove: async () => ({ status: "removed" }),
    pin: async () => ({ status: "saved" }),
    unpin: async () => ({ status: "saved" }),
    subscribe: () => () => {},
    dispose: () => {},
    ...overrides,
  };
}
