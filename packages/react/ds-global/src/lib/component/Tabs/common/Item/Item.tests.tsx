import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import Item from "./Item.js";

const inList = (ui: React.ReactElement) => render(<ul>{ui}</ul>);

describe("Tabs Item (internal renderer)", () => {
  it("renders a navigable item as a link with its url", () => {
    inList(
      <Item
        item={{ url: "/specs", label: "Specs" }}
        active={false}
        LinkComponent="a"
      />,
    );
    expect(screen.getByRole("link", { name: "Specs" })).toHaveAttribute(
      "href",
      "/specs",
    );
  });

  it("renders an item without a url as inert text (a span), marked data-inert", () => {
    inList(
      <Item
        item={{ key: "soon", label: "Coming soon" }}
        active={false}
        LinkComponent="a"
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Coming soon").tagName).toBe("SPAN");
    expect(screen.getByRole("listitem")).toHaveAttribute("data-inert");
  });

  it("marks the active item with aria-current=page and data-active", () => {
    inList(<Item item={{ url: "/a", label: "A" }} active LinkComponent="a" />);
    expect(screen.getByRole("link", { name: "A" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("listitem")).toHaveAttribute("data-active");
  });

  it("keeps the active indicator hooks on an inert span", () => {
    inList(
      <Item
        item={{ key: "current", label: "Current" }}
        active
        LinkComponent="a"
      />,
    );
    const item = screen.getByRole("listitem");
    const label = screen.getByText("Current");
    expect(item).toHaveAttribute("data-active");
    expect(item).toHaveAttribute("data-inert");
    expect(label).toHaveAttribute("aria-current", "page");
    expect(label).toHaveClass("stroke-block-end");
  });

  it("omits href for a disabled item", () => {
    inList(
      <Item
        item={{ url: "/a", label: "A", disabled: true }}
        active={false}
        LinkComponent="a"
      />,
    );
    expect(screen.getByText("A").closest("a")).not.toHaveAttribute("href");
    expect(screen.getByRole("listitem")).toHaveAttribute("data-disabled");
  });

  it("renders a trailing slot inside the existing tab action after its label", () => {
    inList(
      <Item
        item={{
          url: "/machines",
          label: "Machines",
          slot: <span>42</span>,
        }}
        active={false}
        LinkComponent="a"
      />,
    );
    const link = screen.getByRole("link", { name: "Machines 42" });
    const slot = screen.getByText("42");
    const label = screen.getByText("Machines");

    expect(link).toContainElement(slot);
    expect(link.querySelectorAll("a, button")).toHaveLength(0);
    expect(label).toHaveClass("tabs-label");
    expect(label.compareDocumentPosition(slot)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(slot.parentElement).toHaveClass("tabs-indicator");
    expect(screen.getByRole("listitem")).not.toHaveAttribute("slot");
    expect(link).not.toHaveAttribute("slot");
    expect(link).not.toHaveAttribute("data-ds-density-provider");
    expect(link).not.toHaveAttribute("data-ds-density-policy-version");
  });

  it("keeps numeric zero as visible slot content", () => {
    inList(
      <Item
        item={{ url: "/empty", label: "Empty", slot: 0 }}
        active={false}
        LinkComponent="a"
      />,
    );
    const link = screen.getByRole("link", { name: "Empty 0" });

    expect(link.querySelector(".tabs-indicator")).toHaveTextContent("0");
    expect(link).not.toHaveAttribute("data-ds-density-provider");
  });

  it.each([
    ["an empty string", ""],
    ["a boolean", true],
  ] as const)("does not create an indicator gap for %s", (_label, slot) => {
    const { container } = inList(
      <Item
        item={{ url: "/empty", label: "Empty", slot }}
        active={false}
        LinkComponent="a"
      />,
    );
    const link = screen.getByRole("link", { name: "Empty" });

    expect(link.querySelector(".tabs-indicator")).toBeNull();
    expect(link.querySelector(".tabs-label")).toBeNull();
    expect(container.querySelector(".tabs-link")).toHaveTextContent("Empty");
  });

  it("renders the slot in the same inert span when the tab has no url", () => {
    inList(
      <Item
        item={{ key: "soon", label: "Coming soon", slot: <span>3</span> }}
        active={false}
        LinkComponent="a"
      />,
    );
    const slot = screen.getByText("3");
    const tab = slot.closest(".tabs-link");

    expect(tab?.tagName).toBe("SPAN");
    expect(tab).toContainElement(slot);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("keeps a disabled slot inside the existing anchor surface without an action", () => {
    inList(
      <Item
        item={{
          url: "/blocked",
          label: "Blocked",
          disabled: true,
          slot: <span>7</span>,
        }}
        active={false}
        LinkComponent="a"
      />,
    );
    const slot = screen.getByText("7");
    const anchor = slot.closest("a");

    expect(anchor).not.toHaveAttribute("href");
    expect(anchor).toContainElement(slot);
    expect(screen.getByRole("listitem")).toHaveAttribute("data-disabled");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(document.querySelectorAll("a")).toHaveLength(1);
  });

  it("does not publish a density provider when no slot is present", () => {
    inList(
      <Item
        item={{ url: "/specs", label: "Specs" }}
        active={false}
        LinkComponent="a"
      />,
    );
    const link = screen.getByRole("link", { name: "Specs" });

    expect(link).not.toHaveAttribute("data-ds-density-provider");
    expect(link).not.toHaveAttribute("data-ds-density-policy-version");
    expect(link.querySelector(".tabs-indicator")).toBeNull();
  });
});
