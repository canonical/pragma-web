import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ItemContent from "./ItemContent.js";
import type { ContextMenuItem } from "./types.js";

describe("ItemContent", () => {
  it("draws a context's name, description, badge and current mark", () => {
    const item: ContextMenuItem = {
      key: "acme",
      label: "Acme",
      description: "Main account",
      badge: "3",
      isCurrent: true,
    };
    const { container } = render(<ItemContent item={item} />);
    expect(container.firstElementChild).toHaveClass(
      "ds",
      "side-navigation-context-switcher-item-content",
      "current",
    );
    expect(screen.getByText("Main account")).toHaveClass("description");
    expect(screen.getByText("3")).toHaveClass("badge");
  });

  it("draws a bare context with neither description nor badge", () => {
    const { container } = render(
      <ItemContent item={{ key: "globex", label: "Globex" }} />,
    );
    expect(container.firstElementChild?.className).toBe(
      "ds side-navigation-context-switcher-item-content",
    );
    expect(container.querySelector(".description, .badge")).toBeNull();
  });

  it("draws the create action with its icon and label", () => {
    const item: ContextMenuItem = {
      key: "create-context",
      label: "New",
      renderLabel: <em>New project</em>,
    };
    const { container } = render(<ItemContent item={item} />);
    expect(container.firstElementChild).toHaveClass(
      "ds",
      "side-navigation-context-switcher-item-content",
      "create",
    );
    expect(screen.getByText("New project")).toBeInTheDocument();
  });

  it("spreads native props on its root and merges the class, on both branches", () => {
    const { container, rerender } = render(
      <ItemContent
        item={{ key: "acme", label: "Acme" }}
        className="wide"
        data-testid="entry"
      />,
    );
    expect(container.firstElementChild).toHaveClass(
      "side-navigation-context-switcher-item-content",
      "wide",
    );
    expect(container.firstElementChild).toHaveAttribute("data-testid", "entry");
    rerender(
      <ItemContent
        item={
          {
            key: "create-context",
            label: "New",
            renderLabel: "New",
          } as ContextMenuItem
        }
        className="wide"
        data-testid="entry"
      />,
    );
    expect(container.firstElementChild).toHaveClass("create", "wide");
    expect(container.firstElementChild).toHaveAttribute("data-testid", "entry");
  });
});
