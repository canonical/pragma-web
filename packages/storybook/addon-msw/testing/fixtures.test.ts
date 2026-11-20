import { getResponse } from "msw";
import { describe, expect, it } from "vitest";
import { machines, options, validation } from "./fixtures.js";

/** Read the status `GET path` is answered with by every fixture handler. */
const readStatus = async (path: string): Promise<number | undefined> => {
  const request = new Request(new URL(path, globalThis.location.href));
  return (await getResponse([options, validation, machines], request))?.status;
};

describe("fixtures", () => {
  it("answers each fixture's own route", async () => {
    await expect(readStatus("/api/options")).resolves.toBe(200);
    await expect(readStatus("/api/validate")).resolves.toBe(200);
    await expect(readStatus("/api/machines")).resolves.toBe(200);
  });

  it("answers no other route", async () => {
    await expect(readStatus("/api/users")).resolves.toBeUndefined();
  });
});
