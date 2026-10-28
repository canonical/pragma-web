// @vitest-environment node

import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EntryServer from "./entry.js";
import type { InitialData } from "./types.js";

/** Rejections that reached the process during a test. */
let unhandled: unknown[] = [];
const captureUnhandled = (reason: unknown): void => {
  unhandled.push(reason);
};

beforeEach(() => {
  unhandled = [];
  process.on("unhandledRejection", captureUnhandled);
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  process.off("unhandledRejection", captureUnhandled);
  vi.unstubAllGlobals();
});

/**
 * Render the document for `initialData` and let any rejection settle: an
 * unhandled rejection is reported only once the microtask queue drains with
 * no handler attached, so the macrotask turn is load-bearing.
 */
const renderAndSettle = async (initialData: InitialData): Promise<string> => {
  const html = renderToString(<EntryServer initialData={initialData} />);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return html;
};

describe("EntryServer", () => {
  it("declares the app context and density on <html>", async () => {
    const html = await renderAndSettle({ url: "/stations" });
    expect(html).toContain('<html class="ds site-document docs comfortable">');
  });

  it("adds the reader's theme beside them", async () => {
    const html = await renderAndSettle({ url: "/stations", theme: "dark" });
    expect(html).toContain(
      '<html class="ds site-document docs comfortable dark">',
    );
  });

  it.each(["light", "dark"] as const)(
    "shows the %s theme the reader's cookie stores as selected in the theme control",
    async (theme) => {
      const html = await renderAndSettle({ url: "/not-found", theme });
      expect(html).toContain(`<option value="${theme}" selected="">`);
      expect(html).not.toContain('<option value="system" selected="">');
    },
  );

  it("shows system selected in the theme control while no theme is stored", async () => {
    const html = await renderAndSettle({ url: "/not-found" });
    expect(html).toContain('<option value="system" selected="">');
  });

  it("renders / when the renderer hands it no initial data", async () => {
    // The site has no route at /, so the page is the not-found page.
    const html = renderToString(<EntryServer />);
    expect(html).toContain('id="root"');
    expect(html).toContain("<title>Page not found — Metro</title>");
  });

  it("renders the not-found page for a path that does not decode", async () => {
    const html = await renderAndSettle({ url: "/stations/%ZZ" });
    expect(html).toContain("<title>Page not found — Metro</title>");
  });

  it("renders the not-found page in the document archetype, with the rail", async () => {
    const html = await renderAndSettle({ url: "/nowhere" });
    expect(html).toContain('class="ds document-layout"');
    expect(html).toContain('data-region="primary-nav"');
    expect(html).toMatch(
      /<main class="ds canvas canvas"[^>]*><div class="page"><section class="ds not-found-page">/,
    );
  });

  it.each(["/stations", "/lines", "/definitions"])(
    "renders %s from a cold store without reaching the network",
    async (url) => {
      const html = await renderAndSettle({ url });
      // The store holds nothing, so the canvas's boundary holds its fallback,
      // which the client resolves; the miss rejects inside Relay, which owns
      // it, so nothing escapes to the process and no request is made.
      expect(html).toContain('data-region="canvas"');
      expect(unhandled).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    },
  );
});
