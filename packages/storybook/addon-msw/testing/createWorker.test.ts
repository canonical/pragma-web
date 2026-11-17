import { describe, expect, it } from "vitest";
import createWorker from "./createWorker.js";
import { machines, options, validation } from "./fixtures.js";

describe("createWorker", () => {
  it("starts with no handlers, and starts without doing anything", async () => {
    const worker = createWorker();
    expect(worker.listHandlers()).toEqual([]);
    await expect(worker.start()).resolves.toBeUndefined();
  });

  it("prepends what it is told to use, never listing a handler twice", () => {
    const worker = createWorker();
    worker.use(options);
    worker.use(validation, options);
    expect(worker.listHandlers()).toEqual([validation, options]);
  });

  it("returns to its empty list on a reset with no handlers", () => {
    const worker = createWorker();
    worker.use(options);
    worker.resetHandlers();
    expect(worker.listHandlers()).toEqual([]);
  });

  it("restores the last list it was reset to, as msw does", () => {
    const worker = createWorker();
    worker.resetHandlers(machines);
    worker.use(options);
    worker.resetHandlers();
    expect(worker.listHandlers()).toEqual([machines]);
  });
});
