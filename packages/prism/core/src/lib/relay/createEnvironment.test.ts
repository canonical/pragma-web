// @vitest-environment node

/**
 * The environment's wire format and store identity.
 *
 * The HTTP cases drive the REAL fetch pipeline (createRelayRuntimeNetwork +
 * urlMiddleware + headersMiddleware + persistedQueryMiddleware +
 * httpExecutor) against a stubbed `globalThis.fetch`, pinning the actual
 * request that leaves the process: the pipeline's request envelope starts
 * `body: null`, so dropping the body-writing middleware would POST an empty
 * body and the server would answer 400 "Missing query".
 */

import { type FetchFunction, fetchQuery } from "relay-runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ENTITY_QUERY,
  ENTITY_RESPONSE,
  ENTITY_URI,
  PING_QUERY,
  PING_RESPONSE,
} from "../../../testing/fixtures.js";
import { createEnvironment } from "./createEnvironment.js";
import type { CreateEnvironmentOptions } from "./types.js";

const buildJsonResponse = (payload: unknown): Response =>
  new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });

const originalFetch = globalThis.fetch;

/** Stub `globalThis.fetch` to answer every request with `payload`. */
const stubFetch = (payload: unknown) => {
  const fetchSpy = vi
    .fn<typeof fetch>()
    .mockImplementation(() => Promise.resolve(buildJsonResponse(payload)));
  globalThis.fetch = fetchSpy;
  return fetchSpy;
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("createEnvironment", () => {
  describe("over HTTP", () => {
    it("POSTs a JSON body carrying query text, operation name and variables", async () => {
      const fetchSpy = stubFetch(PING_RESPONSE);

      const environment = createEnvironment({ graphqlUrl: "/graphql" });
      await fetchQuery(environment, PING_QUERY, {}).toPromise();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls.at(0) as [string, RequestInit];
      expect(url).toBe("/graphql");
      expect(init.method).toBe("POST");
      expect(new Headers(init.headers).get("content-type")).toBe(
        "application/json",
      );
      expect(init.body).toBeTruthy();
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      expect(body.operationName).toBe("PrismCorePingQuery");
      expect(body.variables).toEqual({});
      expect(body.query).toContain("query PrismCorePingQuery");
    });

    it("stamps `headers` onto the request without losing the content type", async () => {
      const fetchSpy = stubFetch(PING_RESPONSE);

      const environment = createEnvironment({
        graphqlUrl: "/graphql",
        headers: { "x-request-marker": "1" },
      });
      await fetchQuery(environment, PING_QUERY, {}).toPromise();

      const [, init] = fetchSpy.mock.calls.at(0) as [string, RequestInit];
      const headers = new Headers(init.headers);
      expect(headers.get("x-request-marker")).toBe("1");
      // The "set" merge strategy overwrites only the named key, so the
      // request shaper's own content type survives.
      expect(headers.get("content-type")).toBe("application/json");
    });

    it("delivers the parsed payload back to the caller", async () => {
      stubFetch(PING_RESPONSE);

      const environment = createEnvironment({ graphqlUrl: "/graphql" });
      const data = await fetchQuery(environment, PING_QUERY, {}).toPromise();

      expect(data).toEqual(PING_RESPONSE.data);
    });
  });

  describe("with a fetchFn", () => {
    it("executes every operation through it, bypassing HTTP", async () => {
      const fetchSpy = stubFetch(PING_RESPONSE);
      const fetchFn = vi.fn<FetchFunction>(() =>
        Promise.resolve({ data: { ping: "local" } }),
      );

      const environment = createEnvironment({ fetchFn });
      const data = await fetchQuery(environment, PING_QUERY, {}).toPromise();

      expect(data).toEqual({ ping: "local" });
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("throws without a graphqlUrl or a fetchFn", () => {
    expect(() => createEnvironment({} as CreateEnvironmentOptions)).toThrow(
      "createEnvironment: pass a graphqlUrl or a fetchFn",
    );
    expect(() => createEnvironment({ graphqlUrl: "" })).toThrow(
      "createEnvironment: pass a graphqlUrl or a fetchFn",
    );
  });

  it("seeds the store from `records`", () => {
    const records = {
      "client:root": {
        __id: "client:root",
        __typename: "__Root",
        ping: "seeded",
      },
    };
    const environment = createEnvironment({
      records,
      fetchFn: () => new Promise<never>(() => {}),
    });
    expect(environment.getStore().getSource().get("client:root")).toEqual(
      records["client:root"],
    );
  });

  describe("store identity", () => {
    it("keys an addressable record by its uri, and mints a client id otherwise", async () => {
      const environment = createEnvironment({
        fetchFn: () => Promise.resolve(ENTITY_RESPONSE),
      });
      await fetchQuery(environment, ENTITY_QUERY, {}).toPromise();

      const source = environment.getStore().getSource();
      expect(source.get(ENTITY_URI)).toMatchObject({ name: "Button" });
      const root = source.get("client:root") as Record<
        string,
        { readonly __ref: string }
      >;
      expect(root.entity?.__ref).toBe(ENTITY_URI);
      expect(root.note?.__ref).toMatch(/^client:/);
    });
  });
});
