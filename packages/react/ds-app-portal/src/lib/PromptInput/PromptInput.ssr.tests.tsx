import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_MESSAGES as TOGGLE_MESSAGES } from "./common/DeepThinkingToggle/constants.js";
import { PromptInput } from "./index.js";

describe("PromptInput SSR", () => {
  it("renders without hydration errors", () => {
    const html = renderToString(<PromptInput />);
    expect(html).toContain("ds prompt-input");
  });

  it("renders the controls that are passed", () => {
    const html = renderToString(
      <PromptInput controls={<PromptInput.DeepThinkingToggle />} />,
    );
    expect(html).toContain(TOGGLE_MESSAGES.label);
  });
});
