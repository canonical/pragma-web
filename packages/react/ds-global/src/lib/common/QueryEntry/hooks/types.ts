import type {
  QueryEntryContextValue,
  QueryEntryProviderProps,
} from "../types.js";

/** The props of the provider's state hook: the provider's, without children. */
export type UseProviderStateProps = Omit<QueryEntryProviderProps, "children">;

/** The provider's state, which is the context's value. */
export type UseProviderStateResult = QueryEntryContextValue;
