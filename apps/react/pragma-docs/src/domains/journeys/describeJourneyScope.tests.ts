import { describe, expect, it } from "vitest";
import { JOURNEY_MODEL } from "./__fixtures__/journeyModel.js";
import describeJourneyScope from "./describeJourneyScope.js";
import { ALL_JOURNEYS_FILTER } from "./journeyFilter.js";

describe("describeJourneyScope", () => {
  it("names the drawn coordinate and counts its jobs, served and unserved", () => {
    const first = JOURNEY_MODEL.at(0);
    const scope = describeJourneyScope(
      JOURNEY_MODEL,
      { coordinate: first?.uri, persona: undefined },
      first === undefined ? [] : [first],
    );
    const jobs = first?.jobs ?? [];
    const served = jobs.filter((job) => job.pairings.length > 0).length;
    expect(scope).toEqual({
      coordinate: first?.label,
      jobs: jobs.length,
      served,
      unserved: jobs.length - served,
    });
  });

  it("names no coordinate when every one is drawn, and counts them all", () => {
    const scope = describeJourneyScope(
      JOURNEY_MODEL,
      ALL_JOURNEYS_FILTER,
      JOURNEY_MODEL,
    );
    expect(scope.coordinate).toBeUndefined();
    expect(scope.jobs).toBe(
      JOURNEY_MODEL.flatMap((coordinate) => coordinate.jobs).length,
    );
    expect(scope.served + scope.unserved).toBe(scope.jobs);
  });
});
