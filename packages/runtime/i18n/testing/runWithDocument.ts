import { vi } from "vitest";
import type { FakeDocument } from "./types.js";

/**
 * Run `test` with a fresh fake `document` installed as the global, so a
 * locale source's browser effects can be observed, and restore the globals
 * afterwards, even when `test` throws.
 *
 * @param test - Receives the fake document to assert against.
 * @note - This function is impure - it replaces the global `document` for the
 * duration of `test`, which is the point of the helper.
 */
export default function runWithDocument(
  test: (page: FakeDocument) => void,
): void {
  const page: FakeDocument = {
    cookie: "",
    documentElement: { lang: "", dir: "" },
  };
  vi.stubGlobal("document", page);
  try {
    test(page);
  } finally {
    vi.unstubAllGlobals();
  }
}
