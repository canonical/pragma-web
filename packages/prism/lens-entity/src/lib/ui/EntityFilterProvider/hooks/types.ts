import type { EntityFilterProviderProps, EntityFilterValue } from "../types.js";

/**
 * What `useProviderState` takes: the provider's props minus `children`. The
 * provider has no other prop, so the hook takes no argument.
 */
export type UseProviderStateProps = Omit<EntityFilterProviderProps, "children">;

/** What `useProviderState` returns: the value the provider shares. */
export type UseProviderStateResult = EntityFilterValue;

/** What `useEntityFilter` takes: nothing, since it reads the context in
 * scope. */
export type UseEntityFilterProps = Record<never, never>;

/** What `useEntityFilter` returns: the shared filter and its setter. */
export type UseEntityFilterResult = EntityFilterValue;
