import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import { UIBLOCK_TERM } from "../../testing/fixtures.js";
import definitionsExplorerRecords from "../../testing/records/definitionsExplorerRecords.js";
import { buildDefinitionsExplorerVariables } from "./definitionsQuery.js";
import warmDefinitions from "./warmDefinitions.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

/** An instance's compact address and the IRI the ds namespace expands it to. */
const INSTANCE_TERM = "ds:global.component.button";

/** The captured store, its lookups at `term` answered: neither a class nor a property. */
const storeInstanceLookups = (term: string): RecordMap =>
  ({
    ...definitionsExplorerRecords,
    "client:root": {
      ...(definitionsExplorerRecords["client:root"] as Record<string, unknown>),
      [`ontologyClass(uri:"${term}")`]: null,
      [`ontologyProperty(uri:"${term}")`]: null,
    },
  }) as unknown as RecordMap;

/** The names and variables of the operations `fetchFn` was asked for. */
const listRequests = (fetchFn: ReturnType<typeof createFetchSpy>) =>
  fetchFn.mock.calls.map(([request, variables]) => ({
    name: request.name,
    variables,
  }));

describe("warmDefinitions", () => {
  it("warms an instance's details panel at its expanded address", async () => {
    const fetchFn = createFetchSpy();
    fetchFn.mockImplementation(() => Promise.resolve({ data: {} }));
    setPrefetchEnvironment(
      createEnvironment({
        records: storeInstanceLookups(INSTANCE_TERM),
        fetchFn,
      }),
    );

    await warmDefinitions({ term: INSTANCE_TERM }).catch(() => undefined);

    expect(listRequests(fetchFn)).toContainEqual({
      name: "EntityPanelQuery",
      variables: { id: "https://ds.canonical.com/global.component.button" },
    });
    expect(listRequests(fetchFn).map(({ name }) => name)).not.toContain(
      "DefinitionsExplorerQuery",
    );
  });

  it("warms no details panel for a class", async () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(
      createEnvironment({ records: definitionsExplorerRecords, fetchFn }),
    );

    await warmDefinitions({ term: UIBLOCK_TERM });

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("prefetches the explorer with the selected term on /definitions/:term", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmDefinitions({ term: UIBLOCK_TERM });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("DefinitionsExplorerQuery");
    expect(variables).toEqual(buildDefinitionsExplorerVariables(UIBLOCK_TERM));
  });

  it("prefetches the term-less explorer on /definitions", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmDefinitions({});

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("DefinitionsExplorerQuery");
    expect(variables).toEqual(buildDefinitionsExplorerVariables(undefined));
  });
});
