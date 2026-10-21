import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Canvas from "./Canvas.js";

describe("Canvas SSR", () => {
  it("server-renders the main region with the page inside it", () => {
    const html = renderToString(<Canvas>Test content</Canvas>);
    expect(html).toBe(
      '<main class="ds canvas" data-region="canvas" id="lens-canvas" tabindex="-1">Test content</main>',
    );
  });
});
