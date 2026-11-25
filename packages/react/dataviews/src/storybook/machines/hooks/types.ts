/** The machine stories' hook types: each hook's props. */

import type { MachineProviderConfig, StoryViewStoreConfig } from "../types.js";

/** What `useMachineProvider` takes: how the story's collection is set up. */
export type UseMachineProviderProps = readonly [
  options?: MachineProviderConfig,
];

/** What `useStoryViewStore` takes: how the story's store is set up. */
export type UseStoryViewStoreProps = readonly [options?: StoryViewStoreConfig];
