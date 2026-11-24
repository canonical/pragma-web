import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ConditionMark from "./ConditionMark.js";

describe("ConditionMark", () => {
  it("draws its value's mark, hidden, and takes the root's props", () => {
    const { container } = render(
      <ConditionMark condition="exclusion" className="mark" title="x" />,
    );
    const mark = container.firstElementChild;
    expect(mark).toHaveClass("ds", "condition-mark", "mark");
    expect(mark).toHaveAttribute("data-condition", "exclusion");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveAttribute("title", "x");
  });
});
