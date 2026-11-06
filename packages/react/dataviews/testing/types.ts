import type {
  Collection,
  DataViewsProvider,
  DataViewsProviderConfig,
  Facet,
  HistoryMode,
  PresentationStore,
  Query,
  QueryLocation,
  ReadonlyChannel,
  SavedView,
  Source,
  SourceActionRunner,
  SourceCapabilities,
  SourceDelivery,
  SourcePage,
  SourceRefusal,
  SourceRequest,
  ViewStore,
} from "@canonical/dataviews-core";
import type { machines } from "./machines.js";

/** One value a values facet lists, with how many matching records hold it. */
export type FacetValue = Extract<
  Facet,
  { readonly kind: "values" }
>["values"][number];

/** A channel a test publishes on: the read side plus `set`. */
export type FakeChannel<T> = ReadonlyChannel<T> & {
  readonly set: (next: T) => void;
};

/** One execution the manual source was asked for, and how to answer it. */
export type ManualCall<TRow extends object> = {
  readonly request: SourceRequest;
  readonly deliver: (delivery: SourceDelivery<TRow>) => void;
  /** How many times this execution's release has been called. */
  releases: number;
};

/** Configuration of one manual source. */
export type ManualSourceConfig<TRow extends object> = {
  /** What the source declares. */
  readonly capabilities: SourceCapabilities;
  /** Refusals the declaration cannot express. */
  readonly refusals?: ((query: Query) => readonly SourceRefusal[]) | undefined;
  /** The action runner, when the declaration names actions. */
  readonly runAction?: SourceActionRunner | undefined;
  /**
   * Answer every execution at once with this page. Left out, the test
   * delivers by hand through `latest().deliver`.
   */
  readonly answer?: ((request: SourceRequest) => SourcePage<TRow>) | undefined;
};

/** A source whose deliveries the test drives by hand. */
export type ManualSource<TRow extends object> = {
  readonly source: Source<TRow>;
  /** Every execution asked for, in order. */
  readonly calls: readonly ManualCall<TRow>[];
  /** The nth execution, or a failure rather than a skipped assertion. */
  readonly callAt: (index: number) => ManualCall<TRow>;
  /** The latest execution, or a failure when none was asked for. */
  readonly latest: () => ManualCall<TRow>;
};

/**
 * One write a recording location received: the parameters, and the history
 * mode the writer asked for — null when it asked for none.
 */
export type RecordedWrite = readonly [string, HistoryMode | null];

/** A location port and the record of what passed through it. */
export type RecordingLocation = {
  readonly location: QueryLocation;
  /** Every write, in order. */
  readonly writes: RecordedWrite[];
  /** What the location read at each notification its subscribers received. */
  readonly notifications: string[];
  /** Move the location from outside the loop, as the browser would. */
  readonly move: (params: string) => void;
};

/** A view store kept in memory, with the ways another tab would change it. */
export type MemoryViewStore = {
  readonly store: ViewStore;
  /** Change a record as another tab would, and tell this one. */
  readonly elsewhere: (id: string, changes: Partial<SavedView>) => void;
  /** Delete a record as another tab would, and tell this one. */
  readonly drop: (id: string) => void;
};

/** One record the operator cases look through. */
export type OperatorRecord = {
  readonly id: string;
  /** Deliberately wider than text: the cases include values that are not. */
  readonly name?: unknown;
  /** Deliberately wider than a status, for the same reason. */
  readonly status?: unknown;
};

/**
 * One operator with its operands and the records it holds, in record order.
 * A text operator looks at `name`, a choice operator at `status`.
 */
export type OperatorCase = {
  readonly operator: "contains" | "startsWith" | "isAny" | "isNone";
  readonly operands: readonly string[];
  readonly matches: readonly string[];
  /** What the case pins, for a failure to say. */
  readonly pins: string;
};

/** One record the facet cases compute over. */
export type FacetRecord = {
  readonly id: string;
  readonly name: string;
  /** Deliberately wider than a status: the cases include values that are not. */
  readonly status?: unknown;
  /** Deliberately wider than a number, for the same reason. */
  readonly cores?: unknown;
};

/**
 * One query and the facets it answers: each status with how many matching
 * records hold it, and the least and greatest cores.
 */
export type FacetCase = {
  readonly query: {
    readonly isAny?: readonly string[];
    readonly isNone?: readonly string[];
    readonly gte?: number;
    readonly lte?: number;
    readonly search?: string;
  };
  readonly status: readonly (readonly [string | number, number])[];
  readonly cores: readonly [number | null, number | null];
  /** What the case pins, for a failure to say. */
  readonly pins: string;
};

/** One answer from the mock machine API: its HTTP status and its parsed body. */
export type MockApiAnswer = {
  readonly status: number;
  readonly body: unknown;
};

/** What a mock server has done with the one request a test follows. */
export type MockRequestWatch = {
  /** Settles once the server has received the request. */
  readonly received: Promise<void>;
  /** Whether the server has finished with it, answering it or not. */
  readonly hasEnded: () => boolean;
  /** Stop following the server's events. */
  readonly stop: () => void;
};

/** One machine record, as a source would deliver it. */
export type Machine = {
  readonly id: string;
  readonly name: string;
  readonly status: "failed" | "running";
  readonly cores: number;
};

/** The fields of the machine collection, for typed handles and providers. */
export type MachineFields = typeof machines.schema.fields;

/** How one test's machine provider is set up. */
export type MachineProviderConfig = Omit<
  ManualSourceConfig<Machine>,
  "capabilities"
> & {
  readonly capabilities?: SourceCapabilities | undefined;
  /** The rows every request is answered with at once; by hand when left out. */
  readonly rows?: readonly Machine[] | undefined;
  readonly location?: QueryLocation | undefined;
  readonly views?: ViewStore | undefined;
  readonly presentation?: PresentationStore | undefined;
  readonly snapshot?: DataViewsProviderConfig<
    MachineFields,
    Machine
  >["snapshot"];
};

/** The provider every test drives, over the machine collection. */
export type MachineProvider = DataViewsProvider<MachineFields, Machine>;

/** A machine provider over a manual source, with the source to answer it. */
export type MachineFixture = {
  readonly provider: MachineProvider;
  readonly collection: Collection<MachineFields, Machine>;
  readonly source: ManualSource<Machine>;
};

/** How a faceted fleet provider is set up. */
export type FacetedFleetConfig = {
  /** How many machines the fleet holds; twelve by default. */
  readonly count?: number | undefined;
  /** The URL the provider stands on; none by default. */
  readonly href?: string | undefined;
  /** The query it starts on, as a snapshot carries it; none by default. */
  readonly query?: string | undefined;
  /** The fields it asks facets for; the status and the cores by default. */
  readonly facets?: readonly ("status" | "cores")[] | undefined;
};

/** What the value hook's suites read from a channel: two lists and a page. */
export type Listing = {
  readonly ids: readonly number[];
  readonly other: readonly number[];
  readonly page: number;
};
