/**
 * The machine stories' shapes: one record, the collection's fields, the
 * fields a story may sort, how a story's machine source is built, the
 * provider every story drives and how it is set up, and a story's
 * saved-view store and how that is set up.
 */

import type {
  DataViewsProvider,
  DataViewsProviderConfig,
  PresentationStore,
  QueryLocation,
  SortTerm,
  Source,
  ViewDraft,
  ViewStore,
} from "@canonical/dataviews-core";
import type { IndexedDBFactory } from "@canonical/dataviews-core/indexeddb";
import type { machineCollection } from "./fixtures.js";

/** One machine record, as a source would deliver it. */
export type Machine = {
  readonly id: string;
  readonly name: string;
  readonly status: "running" | "failed" | "pending";
  readonly region: string;
  readonly cores: number;
  readonly owner: string;
  readonly note: string;
};

/** The collection's field definitions, for typing a provider over it. */
export type MachineFields = typeof machineCollection.schema.fields;

/**
 * A field the source can order by — the only kind a story may sort. The
 * source orders by every field of its schema, so a column offering a sort
 * outside it would offer a dead control.
 */
export type SortableField = MachineFields[number]["field"];

/** How a story's machine source is built. */
export type MachineSourceConfig = {
  /** The records; every machine by default. */
  readonly rows?: readonly Machine[] | undefined;
  /** The order the source documents for a query with no term; none by default. */
  readonly defaultSort?: readonly SortTerm[] | undefined;
};

/** The provider every story drives, over the machine collection. */
export type MachineProvider = DataViewsProvider<MachineFields, Machine>;

/** How one story's collection is set up. Read once, when the story mounts. */
export type MachineProviderConfig = {
  /** The source the table reads; every machine by default. */
  readonly source?: (() => Source<Machine>) | undefined;
  /**
   * The query the provider starts on, as the canonical text a snapshot
   * carries; nothing filtered or ordered, on the first page, otherwise.
   */
  readonly query?: string | undefined;
  /** Commands issued once the provider is built: a sort, a search, a selection. */
  readonly prepare?: ((provider: MachineProvider) => void) | undefined;
  /** Where the applied query lives; in the provider alone by default. */
  readonly location?: QueryLocation | undefined;
  /** Where the collection's saved views live; none by default. */
  readonly views?: ViewStore | undefined;
  /** Where the viewer's arrangement lives; in memory for the session by default. */
  readonly presentation?: PresentationStore | undefined;
  /** The fields whose facets every request asks for; none by default. */
  readonly facets?: DataViewsProviderConfig<MachineFields, Machine>["facets"];
};

/**
 * A story's saved-view store — which keeps the viewer's arrangement too —
 * and a way to open another tab over it.
 */
export type StoryViewStore = {
  readonly store: ViewStore & PresentationStore;
  readonly openAnotherTab: () => ViewStore & PresentationStore;
};

/** How one story's saved-view store is set up. Read once, when it mounts. */
export type StoryViewStoreConfig = {
  /** The views the store holds when the story opens. */
  readonly seed?: readonly ViewDraft[] | undefined;
  /** The browser's IndexedDB by default; a stand-in shows refused storage. */
  readonly indexedDB?: IndexedDBFactory | undefined;
};
