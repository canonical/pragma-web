import { describe, expect, it } from "vitest";
import resolveErrorDelivery from "./resolveErrorDelivery.js";

const denied = new Error("403 Forbidden");
const isDenied = (error: unknown) => error === denied;

describe("resolveErrorDelivery", () => {
  it("delivers forbidden, with the error as its cause, where the check says so", () => {
    expect(resolveErrorDelivery(denied, isDenied)).toEqual({
      status: "forbidden",
      cause: denied,
    });
  });

  it("delivers a failure in the error's own words where the check says no", () => {
    const outage = new Error("503 Service Unavailable");
    expect(resolveErrorDelivery(outage, isDenied)).toEqual({
      status: "failed",
      failure: {
        reason: "503 Service Unavailable",
        cause: outage,
        transient: null,
      },
    });
  });

  it("delivers a failure where the adapter was given no check", () => {
    expect(resolveErrorDelivery(denied, undefined)).toMatchObject({
      status: "failed",
      failure: { reason: "403 Forbidden", cause: denied },
    });
  });

  it("delivers a failure where the check answers anything but true", () => {
    const truthy = () => 1 as unknown as boolean;
    expect(resolveErrorDelivery(denied, truthy).status).toBe("failed");
  });

  it("lets the error stand as a failure when the check throws", () => {
    const broken = () => {
      throw new Error("the check broke");
    };
    expect(resolveErrorDelivery(denied, broken)).toMatchObject({
      status: "failed",
      failure: { reason: "403 Forbidden", cause: denied },
    });
  });
});
