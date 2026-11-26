import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AssistiveText from "./AssistiveText.js";

describe("AssistiveText", () => {
  it("keeps its words for assistive technology, and takes the root's props", () => {
    render(
      <button type="button">
        ready
        <AssistiveText className="extra" data-testid="said">
          , 4
        </AssistiveText>
      </button>,
    );
    expect(screen.getByRole("button")).toHaveAccessibleName(/^ready\s?,\s?4$/);
    expect(screen.getByTestId("said")).toHaveClass(
      "ds",
      "assistive-text",
      "extra",
    );
  });
});
