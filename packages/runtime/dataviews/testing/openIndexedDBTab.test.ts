import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import openIndexedDBTab from "./openIndexedDBTab.js";

/** The tab the first test opened, read again by the next. */
let opened: ReturnType<typeof openIndexedDBTab> | null = null;

describe("openIndexedDBTab", () => {
  it("opens a store over the factory it is given", async () => {
    opened = openIndexedDBTab(new IDBFactory());
    await expect(opened.list()).resolves.toEqual({ views: [], unreadable: [] });
  });

  it("disposed the tab once the test that opened it ended", async () => {
    await expect(opened?.list()).rejects.toThrow();
  });
});
