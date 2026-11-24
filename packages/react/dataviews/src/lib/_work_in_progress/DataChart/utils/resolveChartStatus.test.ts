import { describe, expect, it } from "vitest";
import resolveChartStatus from "./resolveChartStatus.js";

const FAILED = { status: "failed", reason: "offline" } as const;

describe("resolveChartStatus", () => {
  it("says nothing over an answer, but a failed refresh", () => {
    expect(resolveChartStatus(null, true, false)).toBeNull();
    expect(resolveChartStatus({ status: "no-data" }, true, false)).toBeNull();
    expect(resolveChartStatus({ status: "pending" }, true, true)).toBeNull();
    expect(
      resolveChartStatus(
        { status: "refresh-failed", reason: "offline" },
        true,
        false,
      ),
    ).toEqual({ status: "refresh-failed", reason: "offline" });
  });

  it("words a stale answer above kept bars as a failed refresh", () => {
    expect(
      resolveChartStatus({ status: "stale", reason: "late" }, true, false),
    ).toEqual({ status: "refresh-failed", reason: "late" });
  });

  it("words a failure above kept bars, no row on screen, as a failed refresh", () => {
    expect(resolveChartStatus(FAILED, true, false)).toEqual({
      status: "refresh-failed",
      reason: "offline",
    });
    expect(
      resolveChartStatus({ status: "refused", reason: "bad" }, true, false),
    ).toEqual({ status: "refresh-failed", reason: "bad" });
  });

  it("is pending while no answer stands and one is on its way", () => {
    expect(resolveChartStatus(FAILED, false, true)).toEqual({
      status: "pending",
    });
    expect(resolveChartStatus({ status: "pending" }, false, false)).toEqual({
      status: "pending",
    });
  });

  it("fails with the reason when no answer stands and none is coming", () => {
    expect(resolveChartStatus(FAILED, false, false)).toEqual(FAILED);
    expect(
      resolveChartStatus({ status: "refused", reason: "bad" }, false, false),
    ).toEqual({ status: "failed", reason: "bad" });
    expect(
      resolveChartStatus({ status: "stale", reason: "late" }, false, false),
    ).toEqual({ status: "failed", reason: "late" });
    expect(resolveChartStatus({ status: "no-access" }, false, false)).toEqual({
      status: "failed",
      reason: "",
    });
  });

  it("says nothing where a settled result carried no facets", () => {
    expect(resolveChartStatus(null, false, false)).toBeNull();
    expect(
      resolveChartStatus({ status: "no-results" }, false, false),
    ).toBeNull();
  });
});
