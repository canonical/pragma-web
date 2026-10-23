// @vitest-environment node

import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import startMetroGraph from "../../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../../testing/types.js";
import buildHomeVariables from "./buildHomeVariables.js";
import warmHome from "./warmHome.js";

let graph: MetroGraph;

beforeAll(async () => {
  graph = await startMetroGraph();
});

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
  graph.requests.length = 0;
});

afterAll(() => graph.close());

describe("warmHome", () => {
  it("prefetches the landing's query with the landing's variables", async () => {
    setPrefetchEnvironment(createEnvironment({ graphqlUrl: graph.url }));
    await warmHome();
    expect(graph.requests).toHaveLength(1);
    const body = JSON.parse(graph.requests.at(0)?.body ?? "{}");
    expect(body.query).toContain("query MetroHomeQuery");
    expect(body.variables).toEqual(buildHomeVariables());
  });

  it("fetches nothing when no environment is published", async () => {
    await expect(warmHome()).resolves.toBeUndefined();
    expect(graph.requests).toHaveLength(0);
  });
});
