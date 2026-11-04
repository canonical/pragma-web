import type { RenderersProviderProps, RenderersValue } from "../types.js";

/** What `useProviderState` reads: the provider's defaults and extensions. */
export type UseProviderStateProps = Pick<
  RenderersProviderProps,
  "defaults" | "extensions"
>;

/** What `useProviderState` returns: the context's value. */
export type UseProviderStateResult = RenderersValue;
