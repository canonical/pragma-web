/** Test-only shapes, named here so a test file imports one place for them. */

import type { HistoryMode, QueryLocation } from "../src/lib/location/index.js";
import type {
  OwnedPresentation,
  PresentationStore,
} from "../src/lib/presentation/index.js";
import type { HistoryPolicy } from "../src/lib/provider/index.js";
import type { Query, Slice } from "../src/lib/query/index.js";
import type {
  QueryIssue,
  SourceDelivery,
  SourcePage,
  SourceRefusal,
} from "../src/lib/result/index.js";
import type { RowRecord } from "../src/lib/rows/index.js";
import type {
  Source,
  SourceActionRunner,
  SourceCapabilities,
  SourceRequest,
} from "../src/lib/source/index.js";
import type { ViewStore } from "../src/lib/views/index.js";
import type { DecodedQuery } from "../src/lib/wire/index.js";

/**
 * One execution the manual source was asked for, and how to answer it.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type ManualCall<TRow extends object = RowRecord> = {
  readonly request: SourceRequest;
  readonly deliver: (delivery: SourceDelivery<TRow>) => void;
  /** How many times this execution's release has been called. */
  releases: number;
};

/**
 * Configuration of one manual source.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type ManualSourceConfig<TRow extends object = RowRecord> = {
  /** What the source declares; nothing executable by default. */
  readonly capabilities?: SourceCapabilities | undefined;
  /** Refusals the declaration cannot express. */
  readonly listRefusals?:
    | ((query: Query) => readonly SourceRefusal[])
    | undefined;
  /** The action runner, when the declaration names actions. */
  readonly runAction?: SourceActionRunner | undefined;
  /**
   * Answer every execution at once with this page. Left out, the test
   * delivers by hand through `callAt(n).deliver`.
   */
  readonly answer?: ((request: SourceRequest) => SourcePage<TRow>) | undefined;
};

/**
 * A source whose deliveries the test drives by hand.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type ManualSource<TRow extends object = RowRecord> = {
  readonly source: Source<TRow>;
  /** Every execution asked for, in order. */
  readonly calls: readonly ManualCall<TRow>[];
  /** The nth execution, or a failure rather than a skipped assertion. */
  readonly callAt: (index: number) => ManualCall<TRow>;
  /** The latest execution, or a failure when none was asked for. */
  readonly readLatest: () => ManualCall<TRow>;
};

/** A counting store, and the number of listeners it holds. */
export type CountingViewStore = {
  readonly store: ViewStore;
  /** How many listeners the store holds right now. */
  readonly subscribers: number;
};

/** Configuration of one counting store. */
export type CountingViewStoreConfig = {
  /**
   * What `subscribe` does before registering; a throw here is the store
   * refusing to be heard, as storage the browser blocks might.
   */
  readonly onSubscribe?: (() => void) | undefined;
};

/**
 * One write a recording location received: the parameters, and the history
 * mode the writer asked for — null when it asked for none.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type RecordedWrite = readonly [string, HistoryMode | null];

/**
 * A location port and the record of what passed through it.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type RecordingLocation = {
  readonly location: QueryLocation;
  /** Every write, in order. */
  readonly writes: RecordedWrite[];
  /** What the location read at each notification its subscribers received. */
  readonly notifications: string[];
  /** How many times the port was read. */
  readonly countReads: () => number;
  /** How many times the port was subscribed to. */
  readonly countSubscriptions: () => number;
  /** Move the location from outside the loop, as the browser would. */
  readonly move: (params: string) => void;
};

/** A promise and its settling functions, to answer a stand-in call on cue. */
export type Deferred<T> = {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (error: unknown) => void;
};

/** The field whose every read a set of counted rows counts. */
export type CountedField = "name" | "status";

/** Rows whose counted field counts every read, and how many there were. */
export type CountedRows = {
  readonly rows: readonly RowRecord[];
  readonly readCount: () => number;
};

/** The row a settled page carries: an identity and nothing else. */
export type SettledRow = { readonly id: string };

/**
 * One link as the wire grammar reads it: the parameters, the query and the
 * issues they decode to, and the parameters written back over them.
 */
export type LinkReading = {
  readonly params: string;
  readonly slice: Slice;
  readonly issues: readonly QueryIssue[];
  readonly encoded: string;
};

/**
 * One followed link written back with its refusals carried: how it read,
 * what was written, and how that reads.
 */
export type RespelledLink = {
  readonly decoded: DecodedQuery;
  readonly written: URLSearchParams;
  readonly reread: DecodedQuery;
};

/**
 * What a file is to the file rules, read from its name: only a source file
 * is judged.
 */
export type FileRole =
  | "test"
  | "d.ts"
  | "stories"
  | "spec"
  | "config"
  | "barrel"
  | "css"
  | "source"
  | "other";

/** What one export carries: a type, a function, a value, a class or a re-export. */
export type ExportKind =
  | "type"
  | "function"
  | "value"
  | "class"
  | "reexport"
  | "unknown";

/** How a local binding is declared, as the declaration rule tells them apart. */
export type BindingForm =
  /** A `function` declaration. */
  | "function"
  /** A `class` declaration. */
  | "class"
  /** A variable holding a function or a plain value. */
  | "variable"
  /** A variable holding a call or a cast, such as a context or a memo. */
  | "wrapped"
  /** A type, an enum, an import, or nothing found. */
  | "other";

/** A local binding: what it exports as, and how it is declared. */
export type LocalBinding = {
  readonly kind: ExportKind;
  readonly form: BindingForm;
};

/** One export of a source text, as the export rule reads it. */
export type ExportRecord = {
  /** The exported name; null for an anonymous default. */
  readonly name: string | null;
  readonly kind: ExportKind;
  readonly isDefault: boolean;
  /** Exported on a separate line from a declaration that could carry it. */
  readonly isAtEnd: boolean;
  /** The callee of `export default callee(…)`. */
  readonly wrapper?: string;
  /** The wrapper is `memo` or `forwardRef` over a `function` declaration. */
  readonly wrapsFunction?: boolean;
};

/** A presentation with the store it runs over, for one script to run twice. */
export type ScriptedPresentation = {
  readonly store: PresentationStore;
  readonly presentation: OwnedPresentation;
};

/** A machine row whose fields other than its id may be absent. */
export type SparseMachine = {
  readonly id: string;
  readonly name?: string;
  readonly cpu?: number;
};

/** A machine row with a status, as a row model reads it. */
export type StatusMachine = { readonly id: string; readonly status: string };

/** A row identified by a `uuid` rather than an `id`. */
export type UuidRow = { readonly uuid: string };

/** An instance of the container record type. */
export type ContainerInstance = {
  readonly id: string;
  readonly type: "container";
  readonly processes?: number;
};

/** An instance of the virtual-machine record type. */
export type VirtualMachineInstance = {
  readonly id: string;
  readonly type: "virtual-machine";
  readonly secureboot?: string;
};

/** A row of either record type. */
export type Instance = ContainerInstance | VirtualMachineInstance;

/** What a location test sets up its provider with. */
export type LocationSetUp = {
  readonly href?: string | undefined;
  readonly location?: QueryLocation | undefined;
  readonly capabilities?: SourceCapabilities | undefined;
  /** The query the provider starts from, as a snapshot carries it. */
  readonly query?: string | undefined;
  readonly history?: HistoryPolicy | undefined;
};
