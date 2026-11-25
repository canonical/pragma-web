import type { QueryEntryContextValue } from "../types.js";

/** What the provider's state hook takes: the provider's input props merger. */
export type UseProviderStateProps = readonly [
  getInputProps: QueryEntryContextValue["getInputProps"],
];

/** The provider's state, which is the context's value. */
export type UseProviderStateResult = QueryEntryContextValue;

/** The combobox host driving the query entry, or `undefined` without one. */
export type UseQueryEntryResult = QueryEntryContextValue | undefined;
