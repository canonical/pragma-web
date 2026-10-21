import type { LensFilterValue } from "../types.js";

/** What `useProviderState` returns: the value the provider shares. */
export type UseProviderStateResult = LensFilterValue;

/** What `useLensFilter` returns: the shared filter and its setter. */
export type UseLensFilterResult = LensFilterValue;
