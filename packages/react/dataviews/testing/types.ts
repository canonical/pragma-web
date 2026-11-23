import type {
  Collection,
  DataViewsProvider,
  DataViewsProviderConfig,
  PresentationStore,
  QueryLocation,
  ReadonlyChannel,
  SavedView,
  SourceCapabilities,
  ViewStore,
} from "@canonical/dataviews-core";
import type {
  ManualSource,
  ManualSourceConfig,
} from "@canonical/dataviews-core/testing";
import type { RenderHookResult } from "@testing-library/react";
import type { HeaderCellProps } from "../src/lib/_work_in_progress/common/ScopedDataTable/common/HeaderCell/types.js";
import type { BoundFilterProps } from "../src/lib/_work_in_progress/DataViews/common/Filters/common/BoundFilter/types.js";
import type { PresenceFilterProps } from "../src/lib/_work_in_progress/DataViews/common/Filters/common/PresenceFilter/types.js";
import type { TextFilterProps } from "../src/lib/_work_in_progress/DataViews/common/Filters/common/TextFilter/types.js";
import type { Machine } from "../src/storybook/machines/index.js";
import type { machines } from "./machines.js";

export type { FacetValue } from "../src/storybook/machines/api/index.js";
/** One machine record, the shape the stories and the tests share. */
export type { Machine } from "../src/storybook/machines/index.js";

/** A channel a test publishes on: the read side plus `set`. */
export type FakeChannel<T> = ReadonlyChannel<T> & {
  readonly set: (next: T) => void;
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

/** A hook rendered inside a DataViews root, with the fixture it reads. */
export type RootedHook<TResult> = MachineFixture & {
  readonly hook: RenderHookResult<TResult, unknown>;
  /** How many times the hook has rendered so far. */
  readonly readRenders: () => number;
};

/** A record a case needs no field of but its identity. */
export type IdentifiedRecord = { readonly id: string };

/** What a bound filter case sets; the handle, label and definition follow the field. */
export type BoundFilterHarnessProps = Partial<
  Omit<BoundFilterProps, "handle" | "label" | "definition">
> & { readonly field?: "cpu" | "updated" };

/** What a presence filter case sets; the handle, label and field are the root's. */
export type PresenceFilterHarnessProps = Partial<
  Omit<PresenceFilterProps, "handle" | "label" | "field">
>;

/** What a text filter case sets; the handle, label and field are the root's. */
export type TextFilterHarnessProps = Partial<
  Omit<TextFilterProps, "handle" | "label" | "field">
>;

/** A record with an identity and a name. */
export type NamedRecord = { readonly id: string; readonly name: string };

/** A record with an identity and a count of cores. */
export type CoredRecord = { readonly id: string; readonly cores: number };

/** A record with an identity, a status and a spare flag. */
export type SpareRecord = {
  readonly id: string;
  readonly status: string;
  readonly spare: boolean;
};

/** A record with an identity and a status. */
export type StatusRecord = { readonly id: string; readonly status: string };

/** A record with an identity, a status and a CPU count. */
export type CpuRecord = {
  readonly id: string;
  readonly status: string;
  readonly cpu: number;
};

/** A record whose tag may be of any shape. */
export type TaggedRecord = { readonly id: string; readonly tag: unknown };

/** What a header cell case sets; the rest is a plain, unsorted column. */
export type HeaderCellCaseProps = Partial<HeaderCellProps>;

/** What a bundle of one consumer module writes: its chunks and assets. */
export type BundleOutput = {
  readonly output: readonly (
    | { readonly type: "chunk"; readonly moduleIds: readonly string[] }
    | {
        readonly type: "asset";
        readonly fileName: string;
        readonly source: string | Uint8Array;
      }
  )[];
};

/** What a story's requests to the mock endpoints have come to so far. */
export type RequestsRead = {
  /** Requests sent to an endpoint that answers, still waiting on it. */
  readonly waiting: number;
  /**
   * Whether the page shows what its answers say: no request was sent, or
   * one waits on the endpoint that never answers, or nothing on the page
   * is still busy.
   */
  readonly settled: boolean;
};

/** One rule of the sheet: the selectors it resolves to, and its declarations. */
export type ResolvedRule = {
  readonly selectors: readonly string[];
  readonly declarations: string;
};

/** A host measured by its memory. */
export type MemoryRecord = { readonly id: string; readonly memory: number };

/** A record of the values a cell renders by its own rules. */
export type OddRecord = {
  readonly id: string;
  readonly ready: boolean;
  readonly big: bigint;
  readonly shape: object;
};

/** A machine carrying the fields its facets are computed from. */
export type FacetedRecord = IdentifiedRecord & {
  readonly status: string;
  readonly cpu: number;
  readonly name: string;
};

/** A record that may be placed in a region. */
export type PlacedRecord = { readonly id: string; readonly region?: string };

/** A record placed in a region. */
export type RegionRecord = { readonly id: string; readonly region: string };
