import type { PresentationStore } from "../src/lib/presentation/index.js";

/**
 * Create a presentation store that answers as a test says: every call not
 * overridden reads nothing, saves and hears nobody.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function createStandInPresentationStore(
  overrides: Partial<PresentationStore> = {},
): PresentationStore {
  return {
    readPresentation: async () => ({}),
    patchPresentation: async () => ({ status: "saved" }),
    subscribe: () => () => {},
    ...overrides,
  };
}
