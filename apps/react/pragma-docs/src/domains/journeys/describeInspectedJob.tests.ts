import { describe, expect, it } from "vitest";
import {
  BROWSE_JOB,
  JOURNEY_MODEL,
  ORPHAN_JOB,
} from "./__fixtures__/journeyModel.js";
import describeInspectedJob from "./describeInspectedJob.js";

const DOCS = "sem://design-system-docs#";

const JOBS = [
  {
    uri: BROWSE_JOB,
    story: "When I browse, I want the catalog.",
    acceptances: ["listing + filters"],
    coordinates: {
      uri: `${DOCS}coordinate.maker-duo`,
      roles: { edges: [{ node: { uri: `${DOCS}role.writer` } }] },
    },
  },
];

describe("describeInspectedJob", () => {
  it("inspects nothing on the lens index", () => {
    expect(
      describeInspectedJob(JOURNEY_MODEL, JOBS, undefined),
    ).toBeUndefined();
  });

  it("inspects nothing for a job the model does not hold", () => {
    expect(
      describeInspectedJob(JOURNEY_MODEL, JOBS, `${DOCS}job.missing`),
    ).toBeUndefined();
  });

  it("joins the selected job's tree entry with its raw story and coordinate", () => {
    const inspected = describeInspectedJob(JOURNEY_MODEL, JOBS, BROWSE_JOB);
    expect(inspected?.label).toBe("job.l3");
    expect(inspected?.story).toBe("When I browse, I want the catalog.");
    expect(inspected?.acceptances).toEqual(["listing + filters"]);
    expect(inspected?.coordinate).toBe("any actor × writer × any fluency");
    expect(inspected?.pairings.length).toBeGreaterThan(0);
  });

  it("reads a job the operation carries no detail for as storyless", () => {
    const inspected = describeInspectedJob(JOURNEY_MODEL, JOBS, ORPHAN_JOB);
    expect(inspected?.story).toBeUndefined();
    expect(inspected?.acceptances).toEqual([]);
    expect(inspected?.coordinate).toBe("no coordinate");
    expect(inspected?.pairings).toEqual([]);
  });
});
