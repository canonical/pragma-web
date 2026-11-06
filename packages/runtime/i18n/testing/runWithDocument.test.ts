import { afterEach, describe, expect, it } from "vitest";
import runWithDocument from "./runWithDocument.js";

const globals = globalThis as { document?: unknown };

describe("runWithDocument", () => {
  afterEach(() => {
    expect(globals.document).toBeUndefined();
  });

  it("installs a fresh fake document as the global for the callback", () => {
    runWithDocument((page) => {
      expect(globals.document).toBe(page);
      expect(page).toEqual({
        cookie: "",
        documentElement: { lang: "", dir: "" },
      });
    });
  });

  it("hands each call a new document", () => {
    const pages: unknown[] = [];
    runWithDocument((page) => {
      page.cookie = "locale=fr";
      pages.push(page);
    });
    runWithDocument((page) => {
      expect(page.cookie).toBe("");
      pages.push(page);
    });
    expect(pages.at(0)).not.toBe(pages.at(1));
  });

  it("restores the globals after the callback returns", () => {
    runWithDocument(() => {});
    expect(globals.document).toBeUndefined();
  });

  it("restores the globals and rethrows when the callback throws", () => {
    expect(() =>
      runWithDocument(() => {
        throw new Error("boom");
      }),
    ).toThrow("boom");
    expect(globals.document).toBeUndefined();
  });
});
