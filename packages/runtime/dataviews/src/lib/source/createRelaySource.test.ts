import {
  type ConcreteRequest,
  commitLocalUpdate,
  createOperationDescriptor,
  Environment,
  type GraphQLResponse,
  Network,
  Observable,
  RecordSource,
  Store,
  type Variables,
} from "relay-runtime";
import { describe, expect, it, vi } from "vitest";
import {
  countExactly,
  declare,
  declareSort,
  type RelayFetch as Fetch,
  type RelayMachine as Machine,
  type RelayMachinesData as MachinesData,
  type RelayMachinesOperation as MachinesOperation,
  readId,
} from "../../../testing/index.js";
import { createCollection } from "../collection/index.js";
import {
  createDataViewsProvider,
  readProviderHost,
} from "../provider/index.js";
import {
  DEFAULT_WINDOW,
  type Query,
  type ResultWindow,
  type Slice,
} from "../query/index.js";
import {
  type Count,
  type SourceCounts,
  type SourceDelivery,
  type SourceRefusal,
  UNKNOWN_COUNT,
} from "../result/index.js";
import createRelaySource from "./createRelaySource.js";
import type {
  RelayEnvironment,
  RelayPageRequest,
  Source,
  SourceActionRunner,
  SourceCapabilities,
  SourceRequest,
} from "./types.js";

/**
 * The Relay source, exercised against the real `relay-runtime`
 * environment: its normalized store, its fetching, its retention and its
 * local updates. The source imports nothing from Relay — the environment
 * reaches it through the structural surface, which these tests prove
 * Relay's own `Environment` satisfies.
 */

const buildScalar = (name: string) => ({
  alias: null,
  args: null,
  kind: "ScalarField",
  name,
  storageKey: null,
});

const buildLinked = (
  name: string,
  concreteType: string,
  selections: readonly unknown[],
  extra: { readonly plural?: boolean; readonly args?: unknown } = {},
) => ({
  alias: null,
  args: extra.args ?? null,
  concreteType,
  kind: "LinkedField",
  name,
  plural: extra.plural ?? false,
  selections,
  storageKey: null,
});

const argumentDefinitions = ["first", "after", "status"].map((name) => ({
  defaultValue: null,
  kind: "LocalArgument",
  name,
}));

const machinesField = buildLinked(
  "machines",
  "MachineConnection",
  [
    buildScalar("totalCount"),
    buildLinked("pageInfo", "PageInfo", [
      buildScalar("endCursor"),
      buildScalar("hasNextPage"),
    ]),
    buildLinked(
      "edges",
      "MachineEdge",
      [
        buildLinked("node", "Machine", [
          buildScalar("id"),
          buildScalar("name"),
          buildScalar("status"),
        ]),
      ],
      { plural: true },
    ),
  ],
  {
    args: ["after", "first", "status"].map((name) => ({
      kind: "Variable",
      name,
      variableName: name,
    })),
  },
);

/**
 * What the Relay compiler emits for:
 *
 *   query MachinesQuery($first: Int!, $after: String, $status: [String!]) {
 *     machines(first: $first, after: $after, status: $status) {
 *       totalCount
 *       pageInfo { endCursor hasNextPage }
 *       edges { node { id name status } }
 *     }
 *   }
 */
const MachinesQuery = {
  kind: "Request",
  fragment: {
    argumentDefinitions,
    kind: "Fragment",
    metadata: null,
    name: "MachinesQuery",
    selections: [machinesField],
    type: "Query",
    abstractKey: null,
  },
  operation: {
    argumentDefinitions,
    kind: "Operation",
    name: "MachinesQuery",
    selections: [machinesField],
  },
  params: {
    cacheID: "MachinesQuery",
    id: null,
    metadata: {},
    name: "MachinesQuery",
    operationKind: "query",
    text: "query MachinesQuery",
  },
} as unknown as ConcreteRequest;

/** The connection handle relay-compiler 21 writes for `@connection`. */
const connectionHandle = {
  alias: null,
  args: machinesField.args,
  filters: ["status"],
  handle: "connection",
  key: "Machines_machines",
  kind: "LinkedHandle",
  name: "machines",
};

/** The compiler records `@connection` on the query itself in its parameters. */
const connectionMetadata = {
  connection: [
    {
      count: "first",
      cursor: "after",
      direction: "forward",
      path: ["machines"],
    },
  ],
};

/** `MachinesQuery` with other normalization selections and parameters. */
const buildWithSelections = (
  selections: readonly unknown[],
  metadata: Record<string, unknown> = {},
): ConcreteRequest =>
  ({
    ...MachinesQuery,
    operation: { ...MachinesQuery.operation, selections },
    params: { ...MachinesQuery.params, metadata },
  }) as unknown as ConcreteRequest;

/** A normalization field holding other selections. */
const buildField = (
  name: string,
  plural: boolean,
  selections: readonly unknown[],
) => ({ kind: "LinkedField", name, plural, selections });

const machines: readonly Machine[] = [
  { id: "m1", name: "alpha", status: "ready" },
  { id: "m2", name: "beta", status: "failed" },
  { id: "m3", name: "gamma", status: "ready" },
  { id: "m4", name: "delta", status: "failed" },
  { id: "m5", name: "epsilon", status: "ready" },
];

/** The server's answer to one page's variables: a forward connection. */
const answerPage = (variables: Variables): GraphQLResponse => {
  const statuses = variables["status"] as readonly string[] | null;
  const matching = machines.filter(
    (machine) => statuses === null || statuses.includes(machine.status),
  );
  const after = variables["after"] as string | null;
  const start =
    after === null
      ? 0
      : matching.findIndex((machine) => `c:${machine.id}` === after) + 1;
  const size = variables["first"] as number;
  const page = matching.slice(start, start + size);
  const last = page.at(-1);
  return {
    data: {
      machines: {
        totalCount: matching.length,
        pageInfo: {
          endCursor: last === undefined ? null : `c:${last.id}`,
          hasNextPage: start + size < matching.length,
        },
        edges: page.map((node) => ({ node })),
      },
    },
  };
};

/** A real Relay environment over a network the test answers by hand. */
const createRelay = () => {
  const fetches: Fetch[] = [];
  const network = Network.create((_request, variables) =>
    Observable.create<GraphQLResponse>((sink) => {
      let answered = false;
      const fetch: Fetch = {
        variables,
        respond(response = answerPage(variables)) {
          answered = true;
          sink.next(response);
          sink.complete();
        },
        fail(error) {
          answered = true;
          sink.error(error);
        },
        cancelled: false,
      };
      fetches.push(fetch);
      return () => {
        fetch.cancelled = !answered;
      };
    }),
  );
  const environment = new Environment({
    network,
    store: new Store(new RecordSource()),
  });
  /** The nth fetch, or a failure rather than a skipped assertion. */
  const fetchAt = (index: number): Fetch => {
    const fetch = fetches.at(index);
    if (fetch === undefined) {
      throw new Error(`expected a fetch at index ${index}`);
    }
    return fetch;
  };
  return { environment, fetches, fetchAt };
};

/** A forward connection: a status filter, no search, no declareSort, exact counts. */
const connectionCapabilities: SourceCapabilities = declare({
  filter: { status: ["isAny"] },
  counts: { pageable: "exact", matched: "exact" },
  pagination: { kind: "cursor", backward: false, durable: false },
});

/** What an ungrouped connection counts: the matched rows are the visible ones. */
const buildCounts = (matched: Count): SourceCounts => ({
  pageable: matched,
  matched,
});

const readStatuses = (slice: Slice): readonly string[] | null => {
  const predicate = slice.filter.find(({ field }) => field === "status");
  return predicate === undefined ? null : predicate.operands.map(String);
};

const buildOperation = (page: RelayPageRequest) =>
  createOperationDescriptor(MachinesQuery, {
    first: page.first,
    after: page.after,
    status: readStatuses(page.slice),
  });

const createSource = (
  environment: RelayEnvironment,
  overrides: {
    readonly capabilities?: SourceCapabilities;
    readonly isForbidden?: (error: unknown) => boolean;
  } = {},
) =>
  createRelaySource<MachinesOperation>({
    capabilities: overrides.capabilities ?? connectionCapabilities,
    environment,
    buildOperation,
    readConnection: (data: MachinesData) => data.machines,
    ...(overrides.isForbidden === undefined
      ? {}
      : { isForbidden: overrides.isForbidden }),
  });

const emptySlice: Slice = { filter: [], search: null, sort: [], group: [] };

/** A window over the two-row pages these tests read. */
const buildPaged = (overrides: Partial<ResultWindow> = {}): ResultWindow => ({
  ...DEFAULT_WINDOW,
  size: 2,
  ...overrides,
});

const buildRequest = (
  overrides: Partial<SourceRequest> = {},
): SourceRequest => ({
  requestId: "i1:r1",
  slice: emptySlice,
  window: buildPaged(),
  facets: [],
  ...overrides,
});

/** What the source refuses one query, failing loudly without the port. */
const readRefusals = (
  adapter: Source,
  overrides: Partial<Query> = {},
): readonly SourceRefusal[] => {
  const { listRefusals } = adapter;
  if (listRefusals === undefined) {
    throw new Error("expected a source declaring which pages it cannot reach");
  }
  return listRefusals({
    slice: emptySlice,
    window: buildPaged(),
    ...overrides,
  });
};

const buildUnreachable = (page: number): SourceRefusal => ({
  part: "window",
  code: "unreachable-page",
  field: null,
  operator: null,
  reason: `a forward connection reaches page ${page} only from page ${page - 1}`,
});

const createDeliverySpy = () => vi.fn<(delivered: SourceDelivery) => void>();

const listIds = (delivered: SourceDelivery) =>
  delivered.status === "succeeded"
    ? delivered.page.rows.map((row) => (row as Machine).id)
    : delivered;

/** The latest delivery, or a failure rather than a skipped assertion. */
const readLast = (
  deliver: ReturnType<typeof createDeliverySpy>,
): SourceDelivery => {
  const call = deliver.mock.calls.at(-1);
  if (call === undefined) {
    throw new Error("expected a delivery");
  }
  const [delivered] = call;
  return delivered;
};

const machinesCollection = createCollection({
  fields: [{ field: "status", kind: "choices", options: ["ready", "failed"] }],
  identify: readId,
});

/** A window as the snapshot a provider starts from spells it. */
const buildSnapshotAt = (window: ResultWindow) => ({
  query: new URLSearchParams({
    page: String(window.page),
    size: String(window.size),
    ...(window.cursor === null ? {} : { cursor: window.cursor }),
  }).toString(),
  presentation: {},
});

/**
 * A provider over a Relay source, observed as a mounted root observes it:
 * the first observer issues the first request, so `fetchAt(0)` is the
 * observation's own fetch.
 */
const createBound = (
  environment: RelayEnvironment,
  window: ResultWindow = buildPaged(),
) => {
  const provider = createDataViewsProvider({
    collection: machinesCollection,
    source: createSource(environment),
    snapshot: buildSnapshotAt(window),
  });
  const release = provider.observe();
  const readShown = () => {
    const state = provider.state.get();
    return {
      ids: (state.result.rows ?? []).map((row) => (row as Machine).id),
      status: state.result.status,
      counts: state.result.counts,
      matches: state.resultMatchesQuery,
      problem: state.result.problem,
    };
  };
  return {
    provider,
    host: readProviderHost(provider),
    release,
    shown: readShown,
  };
};

/** An environment whose retentions, subscriptions and fetches are counted. */
const countReleases = (environment: RelayEnvironment) => {
  const released = { retentions: 0, subscriptions: 0, fetches: 0 };
  const wrapped: RelayEnvironment = {
    retain(operation) {
      const retention = environment.retain(operation);
      return {
        dispose() {
          released.retentions += 1;
          retention.dispose();
        },
      };
    },
    lookup: (selector) => environment.lookup(selector),
    subscribe(snapshot, callback) {
      const subscription = environment.subscribe(snapshot, callback);
      return {
        dispose() {
          released.subscriptions += 1;
          subscription.dispose();
        },
      };
    },
    execute(config) {
      const observable = environment.execute(config);
      return {
        subscribe(observer) {
          const subscription = observable.subscribe(observer);
          return {
            unsubscribe() {
              released.fetches += 1;
              subscription.unsubscribe();
            },
          };
        },
      };
    },
  };
  return { released, wrapped };
};

describe("createRelaySource", () => {
  describe("createRelaySource over relay-runtime", () => {
    it("delivers the first page as rows, counts, more and cursors together", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      expect(fetchAt(0).variables).toEqual({
        first: 2,
        after: null,
        status: null,
      });
      expect(deliver).not.toHaveBeenCalled();

      fetchAt(0).respond();
      expect(deliver).toHaveBeenCalledTimes(1);
      expect(readLast(deliver)).toEqual({
        status: "succeeded",
        page: {
          rows: [machines.at(0), machines.at(1)],
          groups: null,
          counts: buildCounts(countExactly(5)),
          facets: {},
          more: true,
          cursors: { next: "c:m2", previous: null },
        },
      });
    });

    it("hands the operation builder the query, the page size and the cursor", () => {
      const { environment } = createRelay();
      const build = vi.fn(buildOperation);
      const filtered: Slice = {
        ...emptySlice,
        filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
      };
      createRelaySource<MachinesOperation>({
        capabilities: connectionCapabilities,
        environment,
        buildOperation: build,
        readConnection: (data: MachinesData) => data.machines,
      }).execute(buildRequest({ slice: filtered }), createDeliverySpy());
      expect(build).toHaveBeenCalledWith({
        slice: filtered,
        first: 2,
        after: null,
        facets: [],
      });
    });

    it("pages forward from each page's end cursor", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();

      const deliver = createDeliverySpy();
      adapter.execute(
        buildRequest({ window: buildPaged({ page: 2 }) }),
        deliver,
      );
      expect(fetchAt(1).variables["after"]).toBe("c:m2");
      fetchAt(1).respond();
      expect(listIds(readLast(deliver))).toEqual(["m3", "m4"]);

      adapter.execute(
        buildRequest({ window: buildPaged({ page: 3 }) }),
        deliver,
      );
      expect(fetchAt(2).variables["after"]).toBe("c:m4");
      fetchAt(2).respond();
      expect(listIds(readLast(deliver))).toEqual(["m5"]);
      // The last page ends in a cursor, and no page follows it.
      expect(readLast(deliver)).toMatchObject({
        page: { more: false, cursors: { next: null, previous: null } },
      });
    });

    it("refuses a page no token and no remembered cursor reaches", () => {
      const { environment, fetches } = createRelay();
      expect(
        readRefusals(createSource(environment), {
          window: buildPaged({ page: 3 }),
        }),
      ).toEqual([buildUnreachable(3)]);
      expect(fetches).toHaveLength(0);
    });

    it("refuses nothing for the first page or a page its trail reaches", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      expect(readRefusals(adapter)).toEqual([]);
      adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      expect(
        readRefusals(adapter, { window: buildPaged({ page: 2 }) }),
      ).toEqual([]);
    });

    it("prefers the window's own token over a remembered cursor", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      // The trail remembers "c:m2" for page two; the window names another, and
      // a token reaches a page no trail ever did.
      const carried = buildPaged({ page: 2, cursor: "c:m1" });
      expect(readRefusals(adapter, { window: carried })).toEqual([]);
      expect(
        readRefusals(adapter, {
          window: buildPaged({ page: 9, cursor: "c:m4" }),
        }),
      ).toEqual([]);
      adapter.execute(buildRequest({ window: carried }), createDeliverySpy());
      expect(fetchAt(1).variables["after"]).toBe("c:m1");
    });

    it("guards execute against a page nothing reaches", () => {
      const { environment, fetches } = createRelay();
      expect(() =>
        createSource(environment).execute(
          buildRequest({ window: buildPaged({ page: 3 }) }),
          createDeliverySpy(),
        ),
      ).toThrow("a forward connection reaches page 3 only from page 2");
      expect(fetches).toHaveLength(0);
    });

    it("keeps cursors per page size, since a size change moves every boundary", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      expect(
        readRefusals(adapter, { window: buildPaged({ page: 2, size: 3 }) }),
      ).toEqual([buildUnreachable(2)]);
    });

    it("shares cursors between respellings of the same query", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      const spelled: Slice = {
        ...emptySlice,
        filter: [
          { field: "status", operator: "isAny", operands: ["ready", "failed"] },
        ],
      };
      const respelled: Slice = {
        ...emptySlice,
        filter: [
          { field: "status", operator: "isAny", operands: ["failed", "ready"] },
        ],
      };
      adapter.execute(buildRequest({ slice: spelled }), createDeliverySpy());
      fetchAt(0).respond();
      adapter.execute(
        buildRequest({ slice: respelled, window: buildPaged({ page: 2 }) }),
        createDeliverySpy(),
      );
      expect(fetchAt(1).variables["after"]).toBe("c:m2");
    });

    it("keeps each query's cursors apart from another's", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      const failed: Slice = {
        ...emptySlice,
        filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
      };
      expect(
        readRefusals(adapter, {
          slice: failed,
          window: buildPaged({ page: 2 }),
        }),
      ).toEqual([buildUnreachable(2)]);
    });

    it("remembers the cursors of the most recently used queries only", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      const requestFirstPage = (size: number) => {
        adapter.execute(
          buildRequest({ window: buildPaged({ size }) }),
          createDeliverySpy(),
        );
      };
      // Two queries with cursors, the second one older only by use.
      requestFirstPage(2);
      fetchAt(0).respond();
      requestFirstPage(3);
      fetchAt(1).respond();
      for (let size = 4; size < 34; size += 1) {
        requestFirstPage(size);
      }
      // Paging on the oldest makes it the most recently used…
      adapter.execute(
        buildRequest({ window: buildPaged({ page: 2 }) }),
        createDeliverySpy(),
      );
      // …so one more query pushes out the one used least recently instead.
      requestFirstPage(34);
      adapter.execute(
        buildRequest({ window: buildPaged({ page: 2 }) }),
        createDeliverySpy(),
      );
      expect(fetchAt(34).variables["after"]).toBe("c:m2");
      expect(
        readRefusals(adapter, { window: buildPaged({ page: 2, size: 3 }) }),
      ).toEqual([buildUnreachable(2)]);
    });

    it("never lets a refused page push another query's cursors out", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      // Thirty-one other queries leave the first one the oldest remembered.
      for (let size = 3; size < 34; size += 1) {
        adapter.execute(
          buildRequest({ window: buildPaged({ size }) }),
          createDeliverySpy(),
        );
      }
      const unreached = buildPaged({ page: 2, size: 99 });
      expect(readRefusals(adapter, { window: unreached })).toEqual([
        buildUnreachable(2),
      ]);
      expect(() =>
        adapter.execute(
          buildRequest({ window: unreached }),
          createDeliverySpy(),
        ),
      ).toThrow("reaches page 2 only from page 1");
      adapter.execute(
        buildRequest({ window: buildPaged({ page: 2 }) }),
        createDeliverySpy(),
      );
      expect(fetchAt(32).variables["after"]).toBe("c:m2");
    });

    it("counts a null total as unknown, and an absent next page as unknown", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      fetchAt(0).respond({
        data: {
          machines: {
            totalCount: null,
            pageInfo: { endCursor: "c:m2", hasNextPage: null },
            edges: [{ node: machines.at(0) }, { node: machines.at(1) }],
          },
        },
      });
      expect(readLast(deliver)).toMatchObject({
        status: "succeeded",
        page: {
          counts: buildCounts(UNKNOWN_COUNT),
          more: null,
          cursors: { next: "c:m2", previous: null },
        },
      });
    });

    it("delivers an empty last page with no cursor to go on from", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      const failed: Slice = {
        ...emptySlice,
        filter: [{ field: "status", operator: "isAny", operands: ["missing"] }],
      };
      const deliver = createDeliverySpy();
      adapter.execute(buildRequest({ slice: failed }), deliver);
      fetchAt(0).respond();
      expect(readLast(deliver)).toEqual({
        status: "succeeded",
        page: {
          rows: [],
          groups: null,
          counts: buildCounts(countExactly(0)),
          facets: {},
          more: false,
          cursors: { next: null, previous: null },
        },
      });
      expect(
        readRefusals(adapter, {
          slice: failed,
          window: buildPaged({ page: 2 }),
        }),
      ).toEqual([buildUnreachable(2)]);
    });

    it("delivers a page already in the store at once, and still fetches it", () => {
      const { environment, fetches, fetchAt } = createRelay();
      const adapter = createSource(environment);
      const release = adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      release();

      const deliver = createDeliverySpy();
      adapter.execute(buildRequest(), deliver);
      expect(listIds(readLast(deliver))).toEqual(["m1", "m2"]);
      expect(fetches).toHaveLength(2);

      // The fetch confirms what the store held: nothing new is delivered.
      fetchAt(1).respond();
      expect(deliver).toHaveBeenCalledTimes(1);
    });

    it("delivers what a fetch changed about a page already in the store", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      const release = adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      release();

      const deliver = createDeliverySpy();
      adapter.execute(buildRequest(), deliver);
      fetchAt(1).respond({
        data: {
          machines: {
            totalCount: 5,
            pageInfo: { endCursor: "c:m2", hasNextPage: true },
            edges: [
              { node: { ...machines.at(0), name: "alpha-renamed" } },
              { node: machines.at(1) },
            ],
          },
        },
      });
      expect(deliver).toHaveBeenCalledTimes(2);
      expect(readLast(deliver)).toMatchObject({
        page: { rows: [{ id: "m1", name: "alpha-renamed" }, machines.at(1)] },
      });
    });

    it("delivers a local update to a displayed record as an external change", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      fetchAt(0).respond();

      commitLocalUpdate(environment, (store) => {
        store.get("m1")?.setValue("alpha-renamed", "name");
      });
      expect(deliver).toHaveBeenCalledTimes(2);
      expect(readLast(deliver)).toMatchObject({
        status: "succeeded",
        page: { rows: [{ id: "m1", name: "alpha-renamed" }, machines.at(1)] },
      });

      // An update to a record this page does not show changes nothing.
      commitLocalUpdate(environment, (store) => {
        store.get("m5")?.setValue("epsilon-renamed", "name");
      });
      expect(deliver).toHaveBeenCalledTimes(2);
    });

    it("delivers a failed fetch as a failure carrying its cause", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      const error = new Error("502 from the graph");
      fetchAt(0).fail(error);
      expect(deliver.mock.calls).toEqual([
        [
          {
            status: "failed",
            failure: {
              reason: "502 from the graph",
              cause: error,
              transient: null,
            },
          },
        ],
      ]);
    });

    it("delivers a fetch the application reads as forbidden as forbidden", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      const denied = new Error("403 from the graph");
      createSource(environment, {
        isForbidden: (error) => error === denied,
      }).execute(buildRequest(), deliver);
      fetchAt(0).fail(denied);
      expect(deliver.mock.calls).toEqual([
        [{ status: "forbidden", cause: denied }],
      ]);
    });

    it("delivers nothing from the store once the fetch is forbidden", () => {
      const { environment, fetchAt } = createRelay();
      const denied = new Error("403 from the graph");
      const adapter = createSource(environment, {
        isForbidden: (error) => error === denied,
      });
      const release = adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      release();

      // The page is in the store, so it is delivered at once; the fetch then
      // says the reader may not see it.
      const deliver = createDeliverySpy();
      adapter.execute(buildRequest(), deliver);
      fetchAt(1).fail(denied);
      expect(readLast(deliver)).toEqual({ status: "forbidden", cause: denied });
      const delivered = deliver.mock.calls.length;
      commitLocalUpdate(environment, (store) => {
        store.get("m1")?.setValue("alpha-renamed", "name");
      });
      expect(deliver).toHaveBeenCalledTimes(delivered);
    });

    it("delivers nothing from the store to a later execution of a forbidden page until its fetch completes", () => {
      const { environment, fetchAt } = createRelay();
      const denied = new Error("403 from the graph");
      const adapter = createSource(environment, {
        isForbidden: (error) => error === denied,
      });
      const first = adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      first();
      const second = adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(1).fail(denied);
      second();

      // A refresh, or a return to the query: the refused page is still in the
      // store, and is not delivered while the fetch runs.
      const deliver = createDeliverySpy();
      adapter.execute(buildRequest(), deliver);
      expect(deliver).not.toHaveBeenCalled();
      commitLocalUpdate(environment, (store) => {
        store.get("m1")?.setValue("alpha-renamed", "name");
      });
      expect(deliver).not.toHaveBeenCalled();
      // Answered again as forbidden, the page stays withdrawn.
      fetchAt(2).fail(denied);
      expect(deliver.mock.calls).toEqual([
        [{ status: "forbidden", cause: denied }],
      ]);
    });

    it("delivers a forbidden page again once a fetch of it completes", () => {
      const { environment, fetchAt } = createRelay();
      const denied = new Error("403 from the graph");
      const adapter = createSource(environment, {
        isForbidden: (error) => error === denied,
      });
      adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).fail(denied);
      const deliver = createDeliverySpy();
      adapter.execute(buildRequest(), deliver);
      fetchAt(1).respond();
      expect(readLast(deliver)).toMatchObject({ status: "succeeded" });
      // Access granted, the next execution reads the store at once again.
      const next = createDeliverySpy();
      adapter.execute(buildRequest(), next);
      expect(readLast(next)).toMatchObject({ status: "succeeded" });
    });

    it("keeps a forbidden mark to its own page", () => {
      const { environment, fetchAt } = createRelay();
      const denied = new Error("403 from the graph");
      const adapter = createSource(environment, {
        isForbidden: (error) => error === denied,
      });
      adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      adapter.execute(
        buildRequest({ window: buildPaged({ page: 2 }) }),
        createDeliverySpy(),
      );
      fetchAt(1).fail(denied);
      const deliver = createDeliverySpy();
      adapter.execute(buildRequest(), deliver);
      expect(readLast(deliver)).toMatchObject({ status: "succeeded" });
    });

    it("delivers a failure where the forbidden check answers no or throws", () => {
      for (const isForbidden of [
        () => false,
        () => {
          throw new Error("the check broke");
        },
      ]) {
        const { environment, fetchAt } = createRelay();
        const deliver = createDeliverySpy();
        createSource(environment, { isForbidden }).execute(
          buildRequest(),
          deliver,
        );
        fetchAt(0).fail(new Error("403"));
        expect(readLast(deliver)).toMatchObject({
          status: "failed",
          failure: { reason: "403" },
        });
      }
    });

    it("fails a page whose response left selected data missing", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      const warn = vi.spyOn(console, "error").mockImplementation(() => {});
      fetchAt(0).respond({
        data: {
          machines: {
            totalCount: 5,
            pageInfo: { endCursor: "c:m2", hasNextPage: true },
            // The second record lacks a field the query selects.
            edges: [
              { node: machines.at(0) },
              { node: { id: "m2", status: "failed" } },
            ],
          },
        },
      });
      warn.mockRestore();
      expect(deliver.mock.calls).toEqual([
        [
          {
            status: "failed",
            failure: {
              reason: "the store is missing data this page selects",
              cause: null,
              transient: null,
            },
          },
        ],
      ]);
    });

    it("fails once while the store stays incomplete, and recovers when it is whole", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      fetchAt(0).respond();

      commitLocalUpdate(environment, (store) => {
        store.get("m1")?.setValue(undefined, "name");
      });
      commitLocalUpdate(environment, (store) => {
        store.get("m2")?.setValue(undefined, "name");
      });
      expect(deliver.mock.calls.slice(1)).toEqual([
        [
          {
            status: "failed",
            failure: {
              reason: "the store is missing data this page selects",
              cause: null,
              transient: null,
            },
          },
        ],
      ]);

      commitLocalUpdate(environment, (store) => {
        store.get("m1")?.setValue("alpha", "name");
        store.get("m2")?.setValue("beta", "name");
      });
      expect(listIds(readLast(deliver))).toEqual(["m1", "m2"]);
    });

    it("fails a page with a missing record rather than delivering it shorter", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      fetchAt(0).respond({
        data: {
          machines: {
            totalCount: 5,
            pageInfo: { endCursor: "c:m2", hasNextPage: true },
            edges: [{ node: machines.at(0) }, { node: null }],
          },
        },
      });
      expect(readLast(deliver)).toMatchObject({
        status: "failed",
        failure: { reason: "the connection carries an edge without a record" },
      });
    });

    it("fails a page when a displayed record is deleted from the store", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      fetchAt(0).respond();
      commitLocalUpdate(environment, (store) => {
        store.delete("m2");
      });
      expect(readLast(deliver)).toMatchObject({
        status: "failed",
        failure: { reason: "the connection carries an edge without a record" },
      });
    });

    it("fails a response that carries no connection", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      fetchAt(0).respond({ data: { machines: null } });
      expect(readLast(deliver)).toEqual({
        status: "failed",
        failure: {
          reason: "the response carries no connection",
          cause: null,
          transient: null,
        },
      });
    });

    it("fails a page with a missing edge rather than delivering it shorter", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      fetchAt(0).respond({
        data: {
          machines: {
            totalCount: 5,
            pageInfo: { endCursor: "c:m2", hasNextPage: true },
            edges: [{ node: machines.at(0) }, null],
          },
        },
      });
      expect(readLast(deliver)).toMatchObject({
        status: "failed",
        failure: { reason: "the connection carries an edge without a record" },
      });
    });

    it("fails a connection that carries no edges", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      fetchAt(0).respond({
        data: {
          machines: {
            totalCount: 5,
            pageInfo: { endCursor: null, hasNextPage: false },
            edges: null,
          },
        },
      });
      expect(readLast(deliver)).toMatchObject({
        status: "failed",
        failure: { reason: "the connection carries no edges" },
      });
    });

    it("fails a connection that carries no page info", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      createSource(environment).execute(buildRequest(), deliver);
      fetchAt(0).respond({
        data: { machines: { totalCount: 5, pageInfo: null, edges: [] } },
      });
      expect(readLast(deliver)).toMatchObject({
        status: "failed",
        failure: { reason: "the connection carries no page info" },
      });
    });

    it("cancels a fetch still in flight on release", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      const release = createSource(environment).execute(
        buildRequest(),
        deliver,
      );
      release();
      expect(fetchAt(0).cancelled).toBe(true);
      fetchAt(0).respond();
      expect(deliver).not.toHaveBeenCalled();
    });

    it("stops following the store on release", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      const release = createSource(environment).execute(
        buildRequest(),
        deliver,
      );
      fetchAt(0).respond();
      expect(deliver).toHaveBeenCalledTimes(1);
      release();
      commitLocalUpdate(environment, (store) => {
        store.get("m1")?.setValue("renamed", "name");
      });
      expect(deliver).toHaveBeenCalledTimes(1);
    });

    it("releases the retention, the store subscription and the fetch together", () => {
      const { environment, fetchAt } = createRelay();
      const { released, wrapped } = countReleases(environment);
      const release = createSource(wrapped).execute(
        buildRequest(),
        createDeliverySpy(),
      );
      fetchAt(0).respond();
      expect(released).toEqual({ retentions: 0, subscriptions: 0, fetches: 0 });
      release();
      expect(released).toEqual({ retentions: 1, subscriptions: 1, fetches: 1 });
    });

    it.each([
      [
        "on the query itself",
        buildWithSelections(
          [...MachinesQuery.operation.selections, connectionHandle],
          connectionMetadata,
        ),
      ],
      [
        "through an unmasked fragment spread",
        buildWithSelections([
          ...MachinesQuery.operation.selections,
          connectionHandle,
        ]),
      ],
      [
        "under a parent field",
        buildWithSelections(
          [
            buildField("viewer", false, [
              ...MachinesQuery.operation.selections,
              connectionHandle,
            ]),
          ],
          connectionMetadata,
        ),
      ],
    ])("refuses a query paging through @connection %s", (_, merging) => {
      const { environment, fetches } = createRelay();
      const adapter = createRelaySource<MachinesOperation>({
        capabilities: connectionCapabilities,
        environment,
        buildOperation: (page) =>
          createOperationDescriptor(merging, {
            first: page.first,
            after: page.after,
            status: null,
          }),
        readConnection: (data: MachinesData) => data.machines,
      });
      expect(() =>
        adapter.execute(buildRequest(), createDeliverySpy()),
      ).toThrow("a query paging through @connection merges its pages");
      expect(fetches).toHaveLength(0);
    });

    it("never refuses a query carrying a handle that is not a connection", () => {
      // Relay writes a handle for other directives too — an appended edge, a
      // deleted record, a client field. Only `@connection` merges pages, so
      // only `@connection` is refused.
      const { environment, fetches } = createRelay();
      const otherHandle = buildWithSelections([
        ...MachinesQuery.operation.selections,
        { ...connectionHandle, handle: "deleteRecord", key: "" },
      ]);
      createRelaySource<MachinesOperation>({
        capabilities: connectionCapabilities,
        environment,
        buildOperation: (page) =>
          createOperationDescriptor(otherHandle, {
            first: page.first,
            after: page.after,
            status: null,
          }),
        readConnection: (data: MachinesData) => data.machines,
      }).execute(buildRequest(), createDeliverySpy());
      expect(fetches).toHaveLength(1);
    });

    it("never refuses a query for a row's own @connection list", () => {
      const { environment, fetches } = createRelay();
      const rowsWithLists = buildWithSelections([
        buildField("machines", false, [
          buildField("edges", true, [
            buildField("node", false, [connectionHandle]),
          ]),
        ]),
      ]);
      createRelaySource<MachinesOperation>({
        capabilities: connectionCapabilities,
        environment,
        buildOperation: (page) =>
          createOperationDescriptor(rowsWithLists, {
            first: page.first,
            after: page.after,
            status: null,
          }),
        readConnection: (data: MachinesData) => data.machines,
      }).execute(buildRequest(), createDeliverySpy());
      expect(fetches).toHaveLength(1);
    });

    it("never lets a refused @connection query push another query's cursors out", () => {
      const { environment, fetchAt } = createRelay();
      const merging = buildWithSelections(
        [...MachinesQuery.operation.selections, connectionHandle],
        connectionMetadata,
      );
      const adapter = createRelaySource<MachinesOperation>({
        capabilities: connectionCapabilities,
        environment,
        // One page size stands for a query paging through @connection.
        buildOperation: (page) =>
          createOperationDescriptor(
            page.first === 99 ? merging : MachinesQuery,
            {
              first: page.first,
              after: page.after,
              status: null,
            },
          ),
        readConnection: (data: MachinesData) => data.machines,
      });
      adapter.execute(buildRequest(), createDeliverySpy());
      fetchAt(0).respond();
      for (let size = 3; size < 34; size += 1) {
        adapter.execute(
          buildRequest({ window: buildPaged({ size }) }),
          createDeliverySpy(),
        );
      }
      expect(() =>
        adapter.execute(
          buildRequest({ window: buildPaged({ size: 99 }) }),
          createDeliverySpy(),
        ),
      ).toThrow("merges its pages");
      adapter.execute(
        buildRequest({ window: buildPaged({ page: 2 }) }),
        createDeliverySpy(),
      );
      expect(fetchAt(32).variables["after"]).toBe("c:m2");
    });

    it("forgets the next page once its page no longer ends in a cursor", () => {
      const { environment, fetchAt } = createRelay();
      const adapter = createSource(environment);
      const deliver = createDeliverySpy();
      adapter.execute(buildRequest(), deliver);
      fetchAt(0).respond();
      commitLocalUpdate(environment, (store) => {
        store
          .getRoot()
          .getLinkedRecord("machines", { after: null, first: 2, status: null })
          ?.getLinkedRecord("pageInfo")
          ?.setValue(null, "endCursor");
      });
      expect(readLast(deliver)).toMatchObject({
        page: { more: true, cursors: { next: null, previous: null } },
      });
      expect(
        readRefusals(adapter, { window: buildPaged({ page: 2 }) }),
      ).toEqual([buildUnreachable(2)]);
    });

    it("fails a page whose connection selector throws", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      const thrown = new Error("the query has no machines field");
      createRelaySource<MachinesOperation>({
        capabilities: connectionCapabilities,
        environment,
        buildOperation,
        readConnection: () => {
          throw thrown;
        },
      }).execute(buildRequest(), deliver);
      fetchAt(0).respond();
      expect(readLast(deliver)).toEqual({
        status: "failed",
        failure: {
          reason: "the query has no machines field",
          cause: thrown,
          transient: null,
        },
      });
    });

    it("fails a page whose selector throws on a store change, never the writer", () => {
      const { environment, fetchAt } = createRelay();
      const deliver = createDeliverySpy();
      let reads = 0;
      createRelaySource<MachinesOperation>({
        capabilities: connectionCapabilities,
        environment,
        buildOperation,
        readConnection: (data: MachinesData) => {
          reads += 1;
          if (reads > 1) {
            throw new Error("the renamed field is not a machine");
          }
          return data.machines;
        },
      }).execute(buildRequest(), deliver);
      fetchAt(0).respond();
      expect(readLast(deliver)).toMatchObject({ status: "succeeded" });
      expect(() =>
        commitLocalUpdate(environment, (store) => {
          store.get("m1")?.setValue("alpha-renamed", "name");
        }),
      ).not.toThrow();
      expect(readLast(deliver)).toMatchObject({
        status: "failed",
        failure: { reason: "the renamed field is not a machine" },
      });
    });

    it("releases what it acquired when the fetch cannot start", () => {
      const { environment } = createRelay();
      const { released, wrapped } = countReleases(environment);
      const offline: RelayEnvironment = {
        ...wrapped,
        execute() {
          throw new Error("offline");
        },
      };
      expect(() =>
        createSource(offline).execute(buildRequest(), createDeliverySpy()),
      ).toThrow("offline");
      expect(released).toEqual({ retentions: 1, subscriptions: 1, fetches: 0 });
    });

    it("freezes the declaration it was handed", () => {
      const { environment } = createRelay();
      const fields = ["name"];
      const capabilities = declare({ sort: declareSort(fields) });
      const adapter = createSource(environment, { capabilities });
      fields.push("zone");
      expect(Object.isFrozen(adapter.capabilities)).toBe(true);
      expect(adapter.capabilities.sort.fields).toEqual(["name"]);
    });

    it("carries the application's row operations", () => {
      const { environment } = createRelay();
      const runAction: SourceActionRunner = vi.fn().mockResolvedValue([]);
      const adapter = createRelaySource<MachinesOperation>({
        capabilities: connectionCapabilities,
        environment,
        buildOperation,
        readConnection: (data: MachinesData) => data.machines,
        runAction,
      });
      expect(adapter.runAction).toBe(runAction);
      const plain = createSource(environment);
      expect("runAction" in plain).toBe(false);
    });
  });

  describe("createRelaySource bound to a collection", () => {
    it("fetches nothing until the provider is observed, and its first page then", () => {
      const { environment, fetches } = createRelay();
      const provider = createDataViewsProvider({
        collection: machinesCollection,
        source: createSource(environment),
        snapshot: buildSnapshotAt(buildPaged()),
      });
      expect(fetches).toHaveLength(0);
      expect(provider.state.get().result.status).toBe("idle");
      const release = provider.observe();
      expect(fetches).toHaveLength(1);
      expect(provider.state.get().result.status).toBe("pending");
      release();
    });

    it("publishes pages under the collection's request identities", () => {
      const { environment, fetchAt } = createRelay();
      const { provider, shown, release } = createBound(environment);
      fetchAt(0).respond();
      expect(shown()).toMatchObject({
        ids: ["m1", "m2"],
        status: "ready",
        counts: buildCounts(countExactly(5)),
        matches: true,
      });

      provider.navigateWindow({ page: 2 });
      expect(shown().status).toBe("pending");
      fetchAt(1).respond();
      expect(shown()).toMatchObject({ ids: ["m3", "m4"], status: "ready" });
      release();
    });

    it("never lets an abandoned filter replace a newer one", () => {
      const { environment, fetchAt } = createRelay();
      const { host, shown, release } = createBound(environment);
      // The observation's own fetch is the first one abandoned.
      host.setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["failed"],
      });
      host.setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["ready"],
      });
      expect(fetchAt(0).cancelled).toBe(true);
      expect(fetchAt(1).cancelled).toBe(true);

      fetchAt(2).respond();
      expect(shown()).toMatchObject({ ids: ["m1", "m3"], status: "ready" });
      // The abandoned fetch answering late reaches nothing.
      fetchAt(1).respond();
      expect(shown()).toMatchObject({
        ids: ["m1", "m3"],
        status: "ready",
        counts: buildCounts(countExactly(3)),
        matches: true,
      });
      release();
    });

    it("follows a local update into the collection without refetching", () => {
      const { environment, fetches, fetchAt } = createRelay();
      const { provider, shown, release } = createBound(environment);
      fetchAt(0).respond();
      const before = provider.state.get().result.provenance;

      commitLocalUpdate(environment, (store) => {
        store.get("m2")?.setValue("failed", "status");
        store.get("m2")?.setValue("beta-renamed", "name");
      });
      const rows = provider.state.get().result.rows as readonly Machine[];
      expect(rows.at(1)).toEqual({
        id: "m2",
        name: "beta-renamed",
        status: "failed",
      });
      expect(provider.state.get().result.provenance).not.toEqual(before);
      expect(shown().matches).toBe(true);
      expect(fetches).toHaveLength(1);
      release();
    });

    it("reports a page reached without its cursor as a refusal", () => {
      const { environment, fetches } = createRelay();
      const { provider, release } = createBound(
        environment,
        buildPaged({ page: 3 }),
      );
      expect(provider.state.get().result).toMatchObject({
        status: "failed",
        rows: null,
        problem: { status: "refused", refusals: [buildUnreachable(3)] },
      });
      // A refused request costs no round trip.
      expect(fetches).toHaveLength(0);
      release();
    });

    it("keeps the rows and reports the failure when a refetch fails", () => {
      const { environment, fetchAt } = createRelay();
      const { provider, shown, release } = createBound(environment);
      fetchAt(0).respond();
      provider.refresh();
      fetchAt(1).fail(new Error("timeout"));
      expect(shown()).toMatchObject({
        ids: ["m1", "m2"],
        status: "refresh-failed",
        matches: true,
        problem: { status: "failed", failure: { reason: "timeout" } },
      });
      release();
    });

    it("releases everything when the provider resets, and requests the new generation's first page", () => {
      const { environment, fetches, fetchAt } = createRelay();
      const { released, wrapped } = countReleases(environment);
      const { provider, release } = createBound(wrapped);
      provider.reset();
      expect(released).toEqual({ retentions: 1, subscriptions: 1, fetches: 1 });
      expect(fetchAt(0).cancelled).toBe(true);
      // Still observed, the provider asks for the new generation's first page.
      expect(fetches).toHaveLength(2);
      expect(provider.state.get().result.status).toBe("pending");
      release();
      expect(released).toEqual({ retentions: 2, subscriptions: 2, fetches: 2 });
    });

    it("releases everything when the observation ends, answered or not", () => {
      const { environment, fetchAt } = createRelay();
      const detaching = countReleases(environment);
      const pending = createBound(detaching.wrapped);
      pending.release();
      expect(detaching.released).toEqual({
        retentions: 1,
        subscriptions: 1,
        fetches: 1,
      });

      const ending = countReleases(environment);
      const answered = createBound(ending.wrapped);
      fetchAt(1).respond();
      answered.release();
      expect(ending.released).toEqual({
        retentions: 1,
        subscriptions: 1,
        fetches: 1,
      });
    });
  });
});
