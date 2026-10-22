// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PORT } from "#site";

/**
 * Load the renderer factory afresh, so it reads `BASE_URL` and `PORT` as the
 * current test stubbed them, and render the sitemap to text.
 */
const renderSitemap = async (): Promise<string> => {
  vi.resetModules();
  const { default: createSitemapRenderer } = await import("./renderer.js");
  return new Response(
    await createSitemapRenderer().renderToReadableStream(),
  ).text();
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createSitemapRenderer", () => {
  it("lists the index of each lens against an absolute BASE_URL", async () => {
    vi.stubEnv("BASE_URL", "https://metro.example");
    const xml = await renderSitemap();
    expect(xml).toContain("<loc>https://metro.example/stations</loc>");
    expect(xml).toContain("<loc>https://metro.example/lines</loc>");
    expect(xml).toContain("<loc>https://metro.example/definitions</loc>");
  });

  it("falls back to localhost on PORT when BASE_URL is not absolute", async () => {
    vi.stubEnv("BASE_URL", "/");
    vi.stubEnv("PORT", "6001");
    expect(await renderSitemap()).toContain(
      "<loc>http://localhost:6001/stations</loc>",
    );
  });

  it("falls back to the dev server's port when neither is set", async () => {
    vi.stubEnv("BASE_URL", undefined);
    vi.stubEnv("PORT", undefined);
    expect(await renderSitemap()).toContain(
      `<loc>http://localhost:${DEFAULT_PORT}/stations</loc>`,
    );
  });
});
