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
  it("accepts a configured endpoint", () => {
    expect(() =>
      assertReleaseGraphqlUrl("https://graph.example.com/graphql"),
    ).not.toThrow();
  });

  it("rejects an unset endpoint", () => {
    expect(() => assertReleaseGraphqlUrl(undefined)).toThrow(
      /VITE_GRAPHQL_URL/,
    );
  });

  it("rejects an empty endpoint", () => {
    expect(() => assertReleaseGraphqlUrl("")).toThrow(/VITE_GRAPHQL_URL/);
  });
});
