import { describe, expect, it } from "vitest";
import createWorker from "./createWorker.js";
import { options } from "./fixtures.js";
import readAnswer from "./readAnswer.js";

describe("readAnswer", () => {
  it("reads the status a served handler answers with", async () => {
    const worker = createWorker();
    worker.use(options);
    await expect(readAnswer(worker, "/api/options")).resolves.toBe(200);
  });

  it("reads nothing for a route no handler answers", async () => {
    await expect(
      readAnswer(createWorker(), "/api/options"),
    ).resolves.toBeUndefined();
  });
});
