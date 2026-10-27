// @vitest-environment node

import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createMetroFetch from "../../../testing/createMetroFetch.js";
import buildNetworkMapVariables from "./buildNetworkMapVariables.js";
import warmNetwork from "./warmNetwork.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmNetwork", () => {
  it("resolves with no request when no environment is published", async () => {
    await expect(warmNetwork()).resolves.toBeUndefined();
  });

  it("fetches the map once, then answers from the store", async () => {
    const fetchFn = createMetroFetch();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));
    await warmNetwork();
    await warmNetwork();
    expect(fetchFn).toHaveBeenCalledOnce();
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("NetworkMapQuery");
    expect(variables).toEqual(buildNetworkMapVariables());
  });
});
