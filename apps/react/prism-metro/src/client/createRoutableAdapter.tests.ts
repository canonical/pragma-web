// @vitest-environment node

import type { PlatformAdapter } from "@canonical/router-core";
import { describe, expect, it, vi } from "vitest";
import { notFoundRoute } from "../routes.js";
import createRoutableAdapter from "./createRoutableAdapter.js";

const DECODABLE = "http://localhost/stations/metro%3Anorthgate";
const UNDECODABLE = "http://localhost/stations/%ZZ";

/** An adapter at `location` whose subscribers the test notifies by hand. */
const createFakeAdapter = (location: string) => {
  const subscribers = new Set<(location: string | URL) => void>();
  const adapter: PlatformAdapter = {
    getLocation: () => new URL(location),
    navigate: vi.fn(),
    subscribe: (callback) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    trackLoad: vi.fn(),
  };
  const notify = (next: string) => {
    for (const subscriber of subscribers) subscriber(new URL(next));
  };
  return { adapter, notify };
};

describe("createRoutableAdapter", () => {
  it.each([
    [DECODABLE, DECODABLE],
    [UNDECODABLE, notFoundRoute.url],
  ])("reads the location %s as %s", (location, expected) => {
    const { adapter } = createFakeAdapter(location);
    expect(createRoutableAdapter(adapter).getLocation()).toBe(expected);
  });

  it("notifies each location as the router can route it", () => {
    const { adapter, notify } = createFakeAdapter(DECODABLE);
    const callback = vi.fn();
    const unsubscribe = createRoutableAdapter(adapter).subscribe(callback);
    notify(UNDECODABLE);
    notify(DECODABLE);
    expect(callback.mock.calls).toEqual([[notFoundRoute.url], [DECODABLE]]);
    unsubscribe();
    notify(DECODABLE);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("navigates and tracks loads through the wrapped adapter", () => {
    const { adapter } = createFakeAdapter(DECODABLE);
    const routable = createRoutableAdapter(adapter);
    const load = Promise.resolve();
    routable.navigate("/lines", { replace: true });
    routable.trackLoad?.(load);
    expect(adapter.navigate).toHaveBeenCalledWith("/lines", { replace: true });
    expect(adapter.trackLoad).toHaveBeenCalledWith(load);
  });
});
