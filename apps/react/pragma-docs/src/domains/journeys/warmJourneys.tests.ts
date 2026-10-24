import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { JOB_URI } from "../../../testing/fixtures.js";
import { journeysExplorerVariables } from "./journeysQuery.js";
import warmJourneys from "./warmJourneys.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmJourneys", () => {
  it("prefetches the explorer with the selected job on /journeys/:job", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmJourneys({ job: JOB_URI });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("JourneysExplorerQuery");
    expect(variables).toEqual(journeysExplorerVariables(JOB_URI));
  });

  it("prefetches the job-less explorer on /journeys", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmJourneys({});

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("JourneysExplorerQuery");
    expect(variables).toEqual(journeysExplorerVariables(undefined));
  });
});
