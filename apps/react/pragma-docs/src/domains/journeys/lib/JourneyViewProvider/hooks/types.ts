import type { JourneyViewProviderProps, JourneyViewValue } from "../types.js";

/**
 * What `useProviderState` takes: the provider's props minus `children`. The
 * provider has no other prop, so the hook takes no argument.
 */
export type UseProviderStateProps = Omit<JourneyViewProviderProps, "children">;

/** What `useProviderState` returns: the value the provider shares. */
export type UseProviderStateResult = JourneyViewValue;

/** What `useJourneyView` takes: nothing, since it reads the context in
 * scope. */
export type UseJourneyViewProps = Record<never, never>;

/** What `useJourneyView` returns: the shared view, the filter and their
 * setters. */
export type UseJourneyViewResult = JourneyViewValue;
