/**
 * Regression: a forbidden refresh withdraws the rows it was asked over.
 *
 * Before the fix, a source had no way to say a request was forbidden: a
 * 403 was a failure, so the rows kept from before stayed on screen under
 * "These rows could not be refreshed: forbidden", still showing data the
 * source had just refused, with the server's words about permissions. Now
 * a forbidden delivery withdraws every row, count and facet, and the status
 * is `no-access`, with no reason. A Relay source that answered forbidden
 * also stops delivering what its store holds for that request, so a later
 * store change cannot bring the withdrawn rows back.
 */

import { describe, expect, it } from "vitest";
import byId from "../../../testing/byId.js";
import createManualSource from "../../../testing/createManualSource.js";
import declare from "../../../testing/declare.js";
import pageOf from "../../../testing/pageOf.js";
import { createCollection } from "../../lib/collection/index.js";
import { resolveDisplayStatus } from "../../lib/display/index.js";
import { createDataViewsProvider } from "../../lib/provider/index.js";
import {
  createRelaySource,
  type RelayEnvironment,
  type RelaySnapshot,
} from "../../lib/source/index.js";

const machines = createCollection({
  identify: byId,
  fields: [{ field: "name", kind: "text" }],
});

describe("regression 0124 — a forbidden refresh kept the rows", () => {
  it("withdraws the rows and says no access, with no reason", () => {
    const { source, callAt } = createManualSource({
      capabilities: declare({}),
    });
    const provider = createDataViewsProvider({ collection: machines, source });
    const release = provider.observe();
    callAt(0).deliver({
      status: "succeeded",
      page: pageOf([{ id: "m-1", name: "alpha" }]),
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
    const rows = {
      edges: [{ node: { id: "m-1", name: "alpha" } }],
      pageInfo: {},
    };
    /** What the store and the fetch were handed to call back. */
    const heard: {
      notify?: (snapshot: RelaySnapshot) => void;
      error?: (error: unknown) => void;
    } = {};
    // The store already holds the page; the fetch then says the reader may
    // not see it.
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
});
