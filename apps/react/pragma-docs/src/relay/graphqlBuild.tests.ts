// @vitest-environment node

/**
 * The release build's endpoint guard.
 *
 * The runtime resolver falls back to the loopback address when nothing is
 * configured, which is correct for development and wrong for a deployment. The
 * guard is the build-time half of that contract: a release client build must
 * carry an explicit endpoint, and an empty value counts as unset.
 */

import { describe, expect, it } from "vitest";
import { assertReleaseGraphqlUrl } from "./graphqlBuild.js";

describe("assertReleaseGraphqlUrl", () => {
  const client = { mode: "production", ssr: false };

  it("accepts a configured endpoint", () => {
    expect(() =>
      assertReleaseGraphqlUrl({
        ...client,
        url: "https://graph.example.com/graphql",
      }),
    ).not.toThrow();
  });

  it.each([undefined, "", " "])("rejects a missing endpoint (%j)", (url) => {
    expect(() => assertReleaseGraphqlUrl({ ...client, url })).toThrow(
      /VITE_GRAPHQL_URL/,
    );
  });

  it("also guards client builds in custom deployment modes", () => {
    expect(() =>
      assertReleaseGraphqlUrl({ ...client, mode: "staging", url: undefined }),
    ).toThrow(/VITE_GRAPHQL_URL/);
  });

  it("lets preview builds use the loopback default", () => {
    expect(() =>
      assertReleaseGraphqlUrl({ ...client, mode: "preview", url: undefined }),
    ).not.toThrow();
  });

  it("lets SSR builds resolve the endpoint at runtime", () => {
    expect(() =>
      assertReleaseGraphqlUrl({ mode: "server", ssr: true, url: undefined }),
    ).not.toThrow();
  });
});
