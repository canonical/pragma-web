import type { RenderersProviderProps, RenderersValue } from "../types.js";

/** What `useProviderState` reads: the provider's defaults and extensions. */
export type UseProviderStateProps = Pick<
  RenderersProviderProps,
  "defaults" | "extensions"
>;

/** What `useProviderState` returns: the context's value. */
export type UseProviderStateResult = RenderersValue;

/** What `useViewLocation` returns: the address's path and parameters. */
export interface UseViewLocationResult {
  /** The page's path. */
  readonly pathname: string;
  /** The address's search parameters, by name. */
  readonly search: Readonly<Record<string, string>>;
}
