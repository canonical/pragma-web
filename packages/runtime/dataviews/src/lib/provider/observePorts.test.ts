import { describe, expect, it, vi } from "vitest";
import observePorts from "./observePorts.js";

/** A port that records its start and stop into the log. */
const createLoggingPort = (name: string, log: string[]) => ({
  observe: () => {
    log.push(`start ${name}`);
    return () => {
      log.push(`stop ${name}`);
    };
  },
});

describe("observePorts", () => {
  it("starts every port in order for the first observer and stops them in reverse for the last", () => {
    const log: string[] = [];
    const afterStart = vi.fn(() => log.push("started"));
    const observation = observePorts({
      ports: [createLoggingPort("a", log), createLoggingPort("b", log)],
      afterStart,
    });
    const first = observation.observe();
    const second = observation.observe();
    expect(observation.observers).toBe(2);
    expect(log).toEqual(["start a", "start b", "started"]);
    first();
    expect(log).toHaveLength(3);
    second();
    expect(observation.observers).toBe(0);
    expect(log).toEqual(["start a", "start b", "started", "stop b", "stop a"]);
    expect(afterStart).toHaveBeenCalledTimes(1);
  });

  it("counts each release once, however often it is called", () => {
    const log: string[] = [];
    const observation = observePorts({
      ports: [createLoggingPort("a", log)],
      afterStart: () => {},
    });
    const first = observation.observe();
    observation.observe();
    first();
    first();
    expect(observation.observers).toBe(1);
    expect(log).toEqual(["start a"]);
  });

  it("stops the ports started before one that cannot start, and holds nothing", () => {
    const log: string[] = [];
    const afterStart = vi.fn();
    const observation = observePorts({
      ports: [
        createLoggingPort("a", log),
        {
          observe: () => {
            throw new Error("write refused");
          },
        },
      ],
      afterStart,
    });
    expect(() => observation.observe()).toThrow("write refused");
    expect(observation.observers).toBe(0);
    expect(log).toEqual(["start a", "stop a"]);
    expect(afterStart).not.toHaveBeenCalled();
  });
});
