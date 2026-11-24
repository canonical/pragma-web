import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessagesContext } from "../contexts/index.js";
import NotApplicable from "./NotApplicable.js";

describe("NotApplicable", () => {
  it("draws a dash hidden from readers, and reads the words beside it", () => {
    const { container } = render(<NotApplicable />);
    expect(container.firstElementChild).toHaveClass(
      "ds",
      "data-views-not-applicable",
    );
    expect(screen.getByText("—")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Not applicable")).toHaveClass("assistive-text");
    expect(container).toHaveTextContent("—Not applicable");
  });

  it("hands a caller's class and attributes to its root", () => {
    const { container } = render(<NotApplicable className="extra" id="na" />);
    expect(container.firstElementChild?.className).toBe(
      "ds data-views-not-applicable extra",
    );
    expect(container.firstElementChild).toHaveAttribute("id", "na");
  });

  it("reads the words of the enclosing messages", () => {
    render(
      <MessagesContext
        value={resolveMessages({ cellNotApplicable: "Sans objet" })}
      >
        <NotApplicable />
      </MessagesContext>,
    );
    expect(screen.getByText("Sans objet")).toBeInTheDocument();
  });
});
