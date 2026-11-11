import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_MESSAGES } from "./constants.js";
import DeepThinkingToggle from "./DeepThinkingToggle.js";

describe("DeepThinkingToggle SSR", () => {
  it("renders without hydration errors", () => {
    const html = renderToString(<DeepThinkingToggle />);
    expect(html).toContain("ds deep-thinking-toggle");
    expect(html).toContain(DEFAULT_MESSAGES.label);
  });
});
