import { afterEach, describe, expect, it } from "vitest";
import { createEnvironment, setPrefetchEnvironment } from "#relay";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { journeysExplorerVariables } from "./journeysQuery.js";
import warmJourneys from "./warmJourneys.js";

const JOB = "sem://design-system-docs#job.l3";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmJourneys", () => {
  it("prefetches the explorer with the selected job on /journeys/:job", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmJourneys({ job: JOB });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("JourneysExplorerQuery");
    expect(variables).toEqual(journeysExplorerVariables(JOB));
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
