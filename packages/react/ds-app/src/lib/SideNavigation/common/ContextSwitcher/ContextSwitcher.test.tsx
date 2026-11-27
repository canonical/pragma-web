import { installPopoverStandIn } from "@canonical/react-ds-global/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import ContextSwitcher from "./ContextSwitcher.js";
import type { ContextSwitcherItem } from "./types.js";

const contexts: ContextSwitcherItem[] = [
  { key: "acme", name: "Acme Corp" },
  { key: "globex", name: "Globex", description: "Secondary account" },
];

// jsdom has no Popover API, which the menu opens through.
let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

/** Opens the menu and waits for it. */
const open = async (): Promise<void> => {
  fireEvent.click(screen.getByRole("button", { name: /Acme Corp/ }));
  await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
};

describe("ContextSwitcher", () => {
  it("shows the current context's name in the trigger, with menu-button semantics", () => {
    render(
      <ContextSwitcher currentContext={contexts[0]} contexts={contexts} />,
    );
    const trigger = screen.getByRole("button", { name: /Acme Corp/ });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("popovertarget");
  });

  it("lists every context, including description, once open", async () => {
    render(
      <ContextSwitcher currentContext={contexts[0]} contexts={contexts} />,
    );
    await open();
    expect(screen.getByText("Globex")).toBeInTheDocument();
    expect(screen.getByText("Secondary account")).toBeInTheDocument();
  });

  it("renders each context as a menuitem", async () => {
    render(
      <ContextSwitcher currentContext={contexts[0]} contexts={contexts} />,
    );
    await open();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("calls onContextChange and closes when a context is selected", async () => {
    const onContextChange = vi.fn();
    render(
      <ContextSwitcher
        currentContext={contexts[0]}
        contexts={contexts}
        onContextChange={onContextChange}
      />,
    );
    await open();
    // The menuitem's accessible name includes its description text (both
    // are content of the same role="menuitem" element), so match on the
    // item's own identifying text rather than an exact accessible name.
    fireEvent.click(
      screen.getByText("Globex").closest('[role="menuitem"]') as HTMLElement,
    );
    expect(onContextChange).toHaveBeenCalledWith(contexts[1]);
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("marks the current context item for styling", async () => {
    render(
      <ContextSwitcher currentContext={contexts[0]} contexts={contexts} />,
    );
    await open();
    expect(
      screen
        .getByText("Acme Corp", { selector: ".name" })
        .closest(".side-navigation-context-switcher-item-content"),
    ).toHaveClass("current");
    expect(
      screen
        .getByText("Globex", { selector: ".name" })
        .closest(".side-navigation-context-switcher-item-content"),
    ).not.toHaveClass("current");
  });

  it("renders a create-context action and calls onCreateContext", async () => {
    const onCreateContext = vi.fn();
    render(
      <ContextSwitcher
        currentContext={contexts[0]}
        contexts={contexts}
        onCreateContext={onCreateContext}
      />,
    );
    await open();
    fireEvent.click(
      screen
        .getByText("Create context")
        .closest('[role="menuitem"]') as HTMLElement,
    );
    expect(onCreateContext).toHaveBeenCalledOnce();
  });

  it("renders the create-context label as a rich node, not just a plain string", async () => {
    render(
      <ContextSwitcher
        currentContext={contexts[0]}
        contexts={contexts}
        onCreateContext={vi.fn()}
        createContextLabel={<strong>New workspace</strong>}
      />,
    );
    await open();
    const label = screen.getByText("New workspace");
    expect(label.tagName).toBe("STRONG");
  });

  it("omits the create-context action when onCreateContext is not given", async () => {
    render(
      <ContextSwitcher currentContext={contexts[0]} contexts={contexts} />,
    );
    await open();
    expect(screen.queryByText("Create context")).not.toBeInTheDocument();
  });

  it("renders a badge when a context has one", async () => {
    const withBadge: ContextSwitcherItem[] = [
      ...contexts,
      { key: "beta", name: "Beta", badge: <span>2</span> },
    ];
    render(
      <ContextSwitcher currentContext={contexts[0]} contexts={withBadge} />,
    );
    await open();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders no caption by default", () => {
    const { container } = render(
      <ContextSwitcher currentContext={contexts[0]} contexts={contexts} />,
    );
    expect(
      container.querySelector(".ds.side-navigation-group-header"),
    ).not.toBeInTheDocument();
  });

  it("renders the title as a GroupHeader caption above the trigger", () => {
    render(
      <ContextSwitcher
        title="Context"
        currentContext={contexts[0]}
        contexts={contexts}
      />,
    );
    const caption = screen.getByText("Context");
    expect(caption).toHaveClass("ds", "side-navigation-group-header");
    // Both are children of the component's own wrapper element — the
    // caption a sibling of the trigger, not nested inside it.
    expect(caption.parentElement).toHaveClass(
      "ds",
      "side-navigation-context-switcher",
    );
    expect(caption.nextElementSibling).toHaveClass(
      "ds",
      "side-navigation-context-switcher-field",
    );
  });

  it("navigates contexts with arrow keys and selects with Enter", async () => {
    const onContextChange = vi.fn();
    render(
      <ContextSwitcher
        currentContext={contexts[0]}
        contexts={contexts}
        onContextChange={onContextChange}
      />,
    );
    await open();
    await waitFor(() =>
      expect(
        screen
          .getByText("Acme Corp", { selector: ".name" })
          .closest('[role="menuitem"]'),
      ).toHaveFocus(),
    );
    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "ArrowDown",
    });
    await waitFor(() =>
      expect(
        screen.getByText("Globex").closest('[role="menuitem"]'),
      ).toHaveFocus(),
    );
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Enter" });
    expect(onContextChange).toHaveBeenCalledWith(contexts[1]);
  });
});
