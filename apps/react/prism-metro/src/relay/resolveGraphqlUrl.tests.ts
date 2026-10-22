// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_GRAPHQL_URL, GRAPHQL_URL_ENV_VAR } from "./constants.js";
import resolveGraphqlUrl from "./resolveGraphqlUrl.js";

const CONFIGURED_URL = "http://graph.example:9999/graphql";

afterEach(() => {
  vi.unstubAllEnvs();
});

// `vi.stubEnv` writes Vite's env and the process env together, the pair the
// resolver reads; which of the two answers is `selectGraphqlUrl`'s concern.
describe("resolveGraphqlUrl", () => {
  it("reads the configured endpoint from the environment", () => {
    vi.stubEnv(GRAPHQL_URL_ENV_VAR, CONFIGURED_URL);
    expect(resolveGraphqlUrl()).toBe(CONFIGURED_URL);
  });

  it("treats an empty value as unset", () => {
    vi.stubEnv(GRAPHQL_URL_ENV_VAR, "");
    expect(resolveGraphqlUrl()).toBe(DEFAULT_GRAPHQL_URL);
  });

  it("falls back to the metro graph's loopback port", () => {
    vi.stubEnv(GRAPHQL_URL_ENV_VAR, undefined);
    expect(resolveGraphqlUrl()).toBe(DEFAULT_GRAPHQL_URL);
    expect(new URL(DEFAULT_GRAPHQL_URL).port).toBe("5176");
  });
});
