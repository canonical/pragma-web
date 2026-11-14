/**
 * Regression: a forbidden refresh withdraws the rows it was asked over.
 *
 * Before the fix, a source had no way to say a request was forbidden: a
 * 403 was a failure, so the rows kept from before stayed on screen under
 * "These rows could not be refreshed: forbidden", still showing data the
 * source had just refused, with the server's words about permissions. Now
 * a forbidden delivery withdraws every row, count and facet, and the status
 * is `no-access`, with no reason. A Relay source that answered forbidden
 * also stops delivering what its store holds for that page until a fetch of
 * it completes, so neither a later store change nor a refresh, which reads
 * the store at once, can bring the withdrawn rows back.
 */

import { describe, expect, it } from "vitest";
import buildPage from "../../../testing/buildPage.js";
import createManualSource from "../../../testing/createManualSource.js";
import declare from "../../../testing/declare.js";
import readId from "../../../testing/readId.js";
import { createCollection } from "../../lib/collection/index.js";
import { resolveDisplayStatus } from "../../lib/display/index.js";
import { createDataViewsProvider } from "../../lib/provider/index.js";
import {
  createRelaySource,
  type RelayEnvironment,
  type RelaySnapshot,
} from "../../lib/source/index.js";

const machines = createCollection({
  identify: readId,
  fields: [{ field: "name", kind: "text" }],
});

/**
 * A provider over a Relay source whose store already holds one page, and
 * whose fetch the test answers through what it was handed to call back.
 */
const observeRelay = () => {
  const rows = {
    edges: [{ node: { id: "m-1", name: "alpha" } }],
    pageInfo: {},
  };
  /** What the store and the latest fetch were handed to call back. */
  const heard: {
    notify?: (snapshot: RelaySnapshot) => void;
    error?: (error: unknown) => void;
    complete?: () => void;
  } = {};
  const environment: RelayEnvironment = {
    retain: () => ({ dispose: () => {} }),
    lookup: () => ({ data: { machines: rows }, isMissingData: false }),
    subscribe: (_snapshot, callback) => {
      heard.notify = callback;
      return { dispose: () => {} };
    },
    execute: () => ({
      subscribe: (observer) => {
        heard.error = observer.error;
        heard.complete = observer.complete;
        return { unsubscribe: () => {} };
      },
    }),
  };
  const denied = new Error("403");
  const source = createRelaySource<{
    readonly response: { readonly machines: typeof rows };
  }>({
    capabilities: declare({
      pagination: { kind: "cursor", backward: false, durable: false },
    }),
    environment,
    operation: () => ({
      fragment: null,
      request: { node: { operation: { selections: [] } } },
    }),
    connection: (data) => data.machines,
    isForbidden: (error) => error === denied,
  });
  const provider = createDataViewsProvider({ collection: machines, source });
  return { provider, heard, rows, denied };
};

describe("regression 0124 — a forbidden refresh kept the rows", () => {
  it("withdraws the rows and says no access, with no reason", () => {
    const { source, callAt } = createManualSource({
      capabilities: declare({}),
    });
    const provider = createDataViewsProvider({ collection: machines, source });
    const release = provider.observe();
    callAt(0).deliver({
      status: "succeeded",
      page: buildPage([{ id: "m-1", name: "alpha" }]),
    });
    expect(provider.rows.get().ids).toHaveLength(1);
    provider.refresh();
    callAt(1).deliver({ status: "forbidden", cause: new Error("403") });
    const { result } = provider.state.get();
    expect(result.rows).toBeNull();
    expect(result.counts).toBeNull();
    expect(result.facets).toBeNull();
    expect(provider.rows.get().ids).toHaveLength(0);
    expect(resolveDisplayStatus(provider.state.get())).toEqual({
      status: "no-access",
    });
    release();
  });

  it("keeps a Relay source's withdrawn rows withdrawn when its store changes", () => {
    const { provider, heard, rows, denied } = observeRelay();
    const release = provider.observe();
    expect(provider.rows.get().ids).toEqual(["m-1"]);
    heard.error?.(denied);
    expect(provider.rows.get().ids).toHaveLength(0);
    heard.notify?.({
      data: { machines: { ...rows, edges: [...rows.edges] } },
      isMissingData: false,
    });
    expect(provider.rows.get().ids).toHaveLength(0);
    expect(resolveDisplayStatus(provider.state.get())).toEqual({
      status: "no-access",
    });
    release();
  });

  it("keeps a Relay source's withdrawn rows withdrawn through a refresh until a fetch completes", () => {
    const { provider, heard, denied } = observeRelay();
    const release = provider.observe();
    heard.error?.(denied);
    // The store still holds the refused page: a refresh reads it at once,
    // and must not show it as ready while the fetch runs.
    provider.refresh();
    expect(provider.rows.get().ids).toHaveLength(0);
    expect(provider.state.get().result.status).not.toBe("ready");
    heard.error?.(denied);
    expect(provider.rows.get().ids).toHaveLength(0);
    expect(resolveDisplayStatus(provider.state.get())).toEqual({
      status: "no-access",
    });
    // A fetch that completes is access granted: the page is shown again.
    provider.refresh();
    heard.complete?.();
    expect(provider.rows.get().ids).toEqual(["m-1"]);
    release();
  });
});
