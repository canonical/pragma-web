import { describe, expect, it } from "vitest";
import { DEFAULT_GRAPHQL_URL } from "./constants.js";
import selectGraphqlUrl from "./selectGraphqlUrl.js";

const VITE_URL = "http://vite.example:9999/graphql";
const PROCESS_URL = "http://process.example:9998/graphql";

describe("selectGraphqlUrl", () => {
  it("prefers Vite's env", () => {
    expect(selectGraphqlUrl(VITE_URL, PROCESS_URL)).toBe(VITE_URL);
  });

  it("reads the process env when Vite's env has no value", () => {
    expect(selectGraphqlUrl(undefined, PROCESS_URL)).toBe(PROCESS_URL);
  });

  it("treats an empty value as unset in both sources", () => {
    expect(selectGraphqlUrl("", PROCESS_URL)).toBe(PROCESS_URL);
    expect(selectGraphqlUrl("", "")).toBe(DEFAULT_GRAPHQL_URL);
  });

  it("falls back to the default when neither source has a value", () => {
    expect(selectGraphqlUrl(undefined, undefined)).toBe(DEFAULT_GRAPHQL_URL);
  });
});
