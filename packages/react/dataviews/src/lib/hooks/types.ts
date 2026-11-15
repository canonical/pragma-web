/**
 * Hook domain types for the hooks every part shares: the value hook that
 * observes one channel, the cell hook a column's own renderer reads, whether
 * scripts have taken over, the focus a server's link hands to the button
 * replacing it, the focus a disabled control strands, and the words a root
 * speaks. Each hook declares its result type here, and its props type where
 * it takes arguments: a config object, or a labelled tuple for a hook whose
 * arguments are positional.
 */

import type {
  Collection,
  DataViewsMessages,
  DataViewsProvider,
  Facet,
  ReadonlyChannel,
  RowRecord,
  SchemaFieldDefinition,
  Selection,
} from "@canonical/dataviews-core";
import type { RowScopes } from "@canonical/dataviews-core/bindings";
import type { FocusEvent, ReactNode, Ref, RefObject } from "react";
import type { AnnouncerHandle, AnnouncerTopic } from "../common/index.js";

/**
 * What `useDataViewsValue` takes with a selector: the channel, the `select`
 * that reads it, and an optional `isEqual` over what `select` returns.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type UseDataViewsValueProps<T, TSelected> = readonly [
  channel: ReadonlyChannel<T>,
  select: (value: T) => TSelected,
  isEqual?: (previous: TSelected, next: TSelected) => boolean,
];

/**
 * What `useDataViewsValue` returns: the channel's current value, or the part
 * `select` picks, held at one reference while `isEqual` says it is the same.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type UseDataViewsValueResult<T> = T;

/**
 * What `useDataViewsCell` takes: the collection the enclosing table's
 * provider was built over, the witness of the record's type.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type UseDataViewsCellProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = readonly [collection: Collection<TFields, TRow>];

/**
 * The cell scope returned by useDataViewsCell. Its channels are read-only.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type UseDataViewsCellResult<TRow extends object = RowRecord> = {
  /** The identity of the row the cell displays. */
  readonly rowId: string;
  /** The id of the column the cell renders. */
  readonly columnId: string;
  /** The whole record; watching it is broader than watching one field. */
  readonly record: ReadonlyChannel<TRow>;
  /** One channel per field the table observes, keyed by field name. */
  readonly fields: Readonly<Record<string, ReadonlyChannel<unknown>>>;
  /** Whether the row is in the collection's selection. */
  readonly selected: ReadonlyChannel<boolean>;
};

/** What `useSelectAllOnPage` takes: the selection, and the page it acts on. */
export type UseSelectAllOnPageProps = {
  /** The collection's selection, which the toggle changes. */
  readonly selection: Selection;
  /** The identities on the page — the scope the control acts on. */
  readonly ids: readonly string[];
};

/**
 * What `useSelectAllOnPage` returns: whether every record on the page is
 * selected, whether only some are, and the toggle that selects or clears them
 * all.
 */
export type UseSelectAllOnPageResult = {
  /** Every identity on the page is selected, and the page has at least one. */
  readonly checked: boolean;
  /** Some identities on the page are selected, but not all. */
  readonly mixed: boolean;
  /** Clear the page's identities when checked, otherwise add them all. */
  readonly toggle: () => void;
};

/** What `useHydrationFocusHandoff` takes: whether scripts have taken over. */
export type UseHydrationFocusHandoffProps = {
  /** Whether scripts have taken over, from `useIsHydrated`. */
  readonly hydrated: boolean;
};

/**
 * What `useHydrationFocusHandoff` returns: the ref for the link a server
 * renders, and the ref for the button that replaces it once hydrated.
 */
export type UseHydrationFocusHandoffResult = {
  /** The link a server renders, attached only before hydration. */
  readonly link: RefObject<HTMLAnchorElement | null>;
  /** The button that replaces the link once hydrated, and takes its focus. */
  readonly button: RefObject<HTMLButtonElement | null>;
};

/** What `useFocusRescue` takes: the control stranded focus goes to. */
export type UseFocusRescueProps = {
  /** The control that takes the focus a disabled or removed control held. */
  readonly fallback: RefObject<HTMLElement | null>;
};

/**
 * What `useFocusRescue` returns: the handlers to spread on the group whose
 * controls it watches.
 */
export type UseFocusRescueResult = {
  /** Records the control that took the focus. */
  readonly onFocus: (event: FocusEvent<HTMLElement>) => void;
  /** Forgets it once the focus leaves. */
  readonly onBlur: () => void;
};

/**
 * What `useMergedRef` takes: the caller's ref, if any, and the part's own
 * attach, which may answer its cleanup.
 */
export type UseMergedRefProps<TElement> = readonly [
  ref: Ref<TElement> | undefined,
  attach: (node: TElement) => (() => void) | undefined,
];

/**
 * What `useMergedRef` returns: one callback ref, answering the cleanup that
 * detaches the part and the caller.
 */
export type UseMergedRefResult<TElement> = (node: TElement) => () => void;

/**
 * What `useIsHydrated` returns: whether scripts have taken over the page —
 * false on the server and while hydrating, true after.
 */
export type UseIsHydratedResult = boolean;

/** What the answered-facets hook takes: the provider whose result answers. */
export type UseAnsweredFacetsProps<
  TFields extends
    readonly SchemaFieldDefinition[] = readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = {
  /** The provider whose result answers the applied query. */
  readonly provider: DataViewsProvider<TFields, TRow>;
};

/** The facets answering the applied query, keyed by field, or null while none does. */
export type UseAnsweredFacetsResult = Readonly<Record<string, Facet>> | null;

/** What the facets hook takes: the provider whose result carries the facets. */
export type UseFacetsProps<
  TFields extends
    readonly SchemaFieldDefinition[] = readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = UseAnsweredFacetsProps<TFields, TRow>;

/** What the facets hook returns, each keyed by field. */
export type UseFacetsResult = {
  /**
   * The facets of the result answering the applied query, or null while no
   * result answers it: what counts and ranges are read from.
   */
  readonly answered: UseAnsweredFacetsResult;
  /**
   * The facets the latest result answered, whichever query it answered, or
   * null before any: what the server's options are listed from, so they stay
   * until a newer result lands.
   */
  readonly latest: Readonly<Record<string, Facet>> | null;
};

/** What `useMessages` takes: the application's messages, if any. */
export type UseMessagesProps = readonly [messages?: Partial<DataViewsMessages>];

/**
 * What `useMessages` returns: every message a root speaks, the application's
 * over the English record.
 */
export type UseMessagesResult = DataViewsMessages;

/**
 * What `useRowScopes` takes: the provider whose rows are scoped, and the
 * names of the fields each scope observes, held at one reference.
 */
export type UseRowScopesProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
> = readonly [
  provider: DataViewsProvider<TFields, TRow>,
  fields: readonly string[],
];

/** The row-scope registry `useRowScopes` mints for one renderer. */
export type UseRowScopesResult<TRow extends object = RowRecord> =
  RowScopes<TRow>;

/** What `useStableCallback` takes: the caller's function, rebuilt or not. */
export type UseStableCallbackProps<
  TArgs extends readonly unknown[],
  TResult,
> = readonly [callback: (...args: TArgs) => TResult];

/** What `useStableCallback` answers: the caller's function behind one identity. */
export type UseStableCallbackResult<
  TArgs extends readonly unknown[],
  TResult,
> = (...args: TArgs) => TResult;

/** What `useAnnouncer` returns: a root's announcer, as the root renders and speaks through it. */
export type UseAnnouncerResult = {
  /** The ref the root renders its announcer's region with. */
  readonly ref: RefObject<AnnouncerHandle | null>;
  /**
   * Say an outcome that has no place on screen, through the region, under a
   * topic where the outcome has one latest answer; one identity for as long
   * as the root is mounted.
   */
  readonly announce: (message: ReactNode, topic?: AnnouncerTopic) => void;
};

/**
 * What `useStableValue` takes: the value rebuilt every render, and whether
 * it says the same as the one held.
 */
export type UseStableValueProps<TValue> = readonly [
  value: TValue,
  equals: (held: TValue, next: TValue) => boolean,
];

/** What `useStableValue` answers: the value held at one reference while it says the same. */
export type UseStableValueResult<TValue> = TValue;
