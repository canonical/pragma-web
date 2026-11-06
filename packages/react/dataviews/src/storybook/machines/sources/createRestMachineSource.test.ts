import {
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type SourceDelivery,
} from "@canonical/dataviews-core";
import { HttpResponse, type HttpResponseResolver, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import answerOverHttp2 from "../../../../testing/answerOverHttp2.js";
import { DELIVERY_WAIT } from "../../../../testing/constants.js";
import readFailureReason from "../../../../testing/readFailureReason.js";
import serveMockApi from "../../../../testing/serveMockApi.js";
import type { Machine } from "../types.js";
import createRestMachineSource from "./createRestMachineSource.js";

// Each test answers the one request its source sends its own way.
const server = serveMockApi([]);

/** Answer the live scenario's requests with one resolver. */
const answerWith = (resolver: HttpResponseResolver): void => {
  server.use(http.get("*/api/live/machines", resolver));
};

describe("createRestMachineSource", () => {
  it("names the status when a failed answer gives no reason", async () => {
    // Status 599 has no standard text, and over HTTP/2 none is given.
    answerOverHttp2();
    answerWith(() => HttpResponse.json({}, { status: 599 }));
    expect(await readFailureReason(createRestMachineSource("live"))).toBe(
      "the endpoint answered 599",
    );
  });

  it("names the status when a failed answer is not JSON", async () => {
    answerOverHttp2();
    answerWith(() => new HttpResponse("<html>", { status: 599 }));
    expect(await readFailureReason(createRestMachineSource("live"))).toBe(
      "the endpoint answered 599",
    );
  });

  it("gives a failed answer's status text when it gives no reason", async () => {
    answerWith(() => HttpResponse.json({}, { status: 503 }));
    expect(await readFailureReason(createRestMachineSource("live"))).toBe(
      "Service Unavailable",
    );
  });

  it("fails an answer that holds no machines rather than showing none", async () => {
    answerWith(() => HttpResponse.json({ matched: 1 }));
    expect(await readFailureReason(createRestMachineSource("live"))).toBe(
      "the endpoint answered without machines",
    );
  });

  it("fails an answer that is not JSON at all", async () => {
    answerWith(() => new HttpResponse("<html>", { status: 200 }));
    expect(await readFailureReason(createRestMachineSource("live"))).toBe(
      "the endpoint answered without a JSON object",
    );
  });

  it("fails JSON that is not an object, a list included", async () => {
    for (const body of ["oops", []]) {
      answerWith(() => HttpResponse.json(body));
      expect(await readFailureReason(createRestMachineSource("live"))).toBe(
        "the endpoint answered without a JSON object",
      );
    }
  });

  it("fails machines that are not a list", async () => {
    answerWith(() => HttpResponse.json({ items: {} }));
    expect(await readFailureReason(createRestMachineSource("live"))).toBe(
      "the endpoint answered without machines",
    );
  });

  it("reads the answer's facets, leaving out any of another shape", async () => {
    answerWith(() =>
      HttpResponse.json({
        items: [],
        matched: 0,
        total: 12,
        facets: {
          cores: { kind: "range", min: 1, max: 8 },
          status: {
            kind: "values",
            values: [
              { value: "failed", count: { kind: "exact", value: 3 } },
              { value: true, count: { kind: "at-least", value: 1 } },
              { value: "running", count: { kind: "unknown" } },
              { value: "pending", count: { kind: "exact" } },
              { value: "x", count: { kind: "other" } },
              { value: "y", count: null },
              { value: {}, count: { kind: "exact", value: 1 } },
              { count: { kind: "exact", value: 1 } },
              null,
            ],
          },
          region: "not a facet",
          owner: { min: 1 },
          name: { kind: "values", values: "none" },
          note: { kind: "range", min: "a", max: 1 },
          id: { kind: "other" },
        },
      }),
    );
    const deliveries: SourceDelivery<Machine>[] = [];
    const stop = createRestMachineSource("live").execute(
      {
        requestId: "facets",
        slice: EMPTY_SLICE,
        window: DEFAULT_WINDOW,
        facets: ["status", "cores"],
      },
      (delivery) => {
        deliveries.push(delivery);
      },
    );
    await vi
      .waitFor(() => expect(deliveries).toHaveLength(1), DELIVERY_WAIT)
      .finally(stop);
    expect(deliveries.at(0)).toMatchObject({
      status: "succeeded",
      page: {
        facets: {
          cores: { kind: "range", min: 1, max: 8 },
          status: {
            kind: "values",
            values: [
              { value: "failed", count: { kind: "exact", value: 3 } },
              { value: true, count: { kind: "at-least", value: 1 } },
              { value: "running", count: { kind: "unknown" } },
            ],
          },
        },
      },
    });
  });

  it("reads no facets from an answer whose facets are not an object", async () => {
    answerWith(() => HttpResponse.json({ items: [], facets: "none" }));
    const deliveries: SourceDelivery<Machine>[] = [];
    const stop = createRestMachineSource("live").execute(
      {
        requestId: "no-facets",
        slice: EMPTY_SLICE,
        window: DEFAULT_WINDOW,
        facets: [],
      },
      (delivery) => {
        deliveries.push(delivery);
      },
    );
    await vi
      .waitFor(() => expect(deliveries).toHaveLength(1), DELIVERY_WAIT)
      .finally(stop);
    expect(deliveries.at(0)).toMatchObject({ status: "succeeded" });
  });

  it("gives a failed answer's own reason", async () => {
    answerWith(() =>
      HttpResponse.json({ reason: "the fleet is resting" }, { status: 503 }),
    );
    expect(await readFailureReason(createRestMachineSource("live"))).toBe(
      "the fleet is resting",
    );
  });

  it("reads no facets from an answer that carries none", async () => {
    answerWith(() => HttpResponse.json({ items: [] }));
    const deliveries: SourceDelivery<Machine>[] = [];
    const stop = createRestMachineSource("live").execute(
      {
        requestId: "facetless",
        slice: EMPTY_SLICE,
        window: DEFAULT_WINDOW,
        facets: [],
      },
      (delivery) => {
        deliveries.push(delivery);
      },
    );
    await vi
      .waitFor(() => expect(deliveries).toHaveLength(1), DELIVERY_WAIT)
      .finally(stop);
    expect(deliveries.at(0)).toMatchObject({ status: "succeeded" });
  });
});
