import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_MESSAGES } from "./constants.js";
import DeepThinkingToggle from "./DeepThinkingToggle.js";

const CUSTOM_LABEL = "Think hard";

describe("DeepThinkingToggle component", () => {
  it("renders a labelled switch", () => {
    render(<DeepThinkingToggle />);
    expect(
      screen.getByRole("switch", { name: DEFAULT_MESSAGES.label }),
    ).toBeInTheDocument();
  });

  it("applies className to the root", () => {
    const { container } = render(<DeepThinkingToggle className="test-class" />);
    expect(container.firstElementChild).toHaveClass(
      "ds",
      "deep-thinking-toggle",
      "test-class",
    );
  });

  it("overrides messages", () => {
    render(<DeepThinkingToggle messages={{ label: CUSTOM_LABEL }} />);
    expect(screen.getByRole("switch", { name: CUSTOM_LABEL })).toBeVisible();
  });
});
