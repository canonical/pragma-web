import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { useIsHydrated } from "../../../../hooks/index.js";
import Header from "./Header.js";
import type { HeaderFilter, HeaderOrder, HeaderProps } from "./types.js";

const filter = (overrides: Partial<HeaderFilter> = {}): HeaderFilter => ({
  field: "actor",
  label: "Reviewer",
  options: [
    { value: "jane", label: "Jane Doe", applied: false, href: "?actor=jane" },
    { value: "john", label: "John Roe", applied: true, href: "?" },
  ],
  onSelect: () => {},
  refusal: null,
  ...overrides,
});

const order = (overrides: Partial<HeaderOrder> = {}): HeaderOrder => ({
  direction: "desc",
  onToggle: () => {},
  refusal: null,
  href: "?sort=at",
  ...overrides,
});

const renderHeader = (overrides: Partial<HeaderProps> = {}) =>
  render(
    <Header
      filters={[filter()]}
      reset={null}
      order={order()}
      hydrated
      {...overrides}
    />,
  );

describe("Header", () => {
  it("leads its filters with the words saying what they do", () => {
    const { container } = renderHeader();
    expect(
      container.querySelector(".filters")?.firstElementChild,
    ).toHaveTextContent("Filter by:");
  });

  it("draws no filters and no lead where there are none", () => {
    const { container } = renderHeader({ filters: [] });
    expect(container.querySelector(".filters")).toBeNull();
  });

  it("offers each filter as the design system's menu, checking the values in force", () => {
    const onSelect = vi.fn();
    renderHeader({ filters: [filter({ onSelect })] });
    fireEvent.click(screen.getByRole("button", { name: "Reviewer" }));
    const menu = screen.getByRole("menu", { name: "Filter by Reviewer" });
    const items = within(menu).getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Jane Doe",
      "John Roe",
    ]);
    expect(items[0]?.querySelector("svg")).toBeNull();
    expect(items[1]?.querySelector("svg")).not.toBeNull();
    fireEvent.click(items[0] as HTMLElement);
    expect(onSelect).toHaveBeenCalledWith("jane");
  });

  it("offers a reset while a filter holds a restriction", () => {
    const onReset = vi.fn();
    renderHeader({ reset: { onReset, href: "?" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByText("Reset")).toHaveClass("label");
  });

  it("states the order in force, with its arrow, and toggles it", () => {
    const onToggle = vi.fn();
    const { container, rerender } = renderHeader({
      order: order({ onToggle }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Latest" }));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(container.querySelector(".order use")).toHaveAttribute(
      "href",
      expect.stringContaining("arrow-down"),
    );
    rerender(
      <Header
        filters={[]}
        reset={null}
        order={order({ direction: "asc" })}
        hydrated
      />,
    );
    expect(
      screen.getByRole("button", { name: "Earliest" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".order use")).toHaveAttribute(
      "href",
      expect.stringContaining("arrow-up"),
    );
    rerender(
      <Header
        filters={[]}
        reset={null}
        order={order({ direction: null })}
        hydrated
      />,
    );
    expect(
      screen.getByRole("button", { name: "Order by date" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".order svg")).toBeNull();
  });

  it("draws no order control where the source cannot order by the date", () => {
    const { container } = renderHeader({ order: null });
    expect(container.querySelector(".order")).toBeNull();
  });

  it("describes a refused control by why it was refused", () => {
    renderHeader({
      filters: [filter({ refusal: "Not filtered: the log is busy." })],
      order: order({ refusal: "Not ordered: the log is busy." }),
    });
    expect(screen.getByText("Not filtered: the log is busy.")).toHaveClass(
      "refusal",
    );
    expect(
      screen.getByRole("button", { name: "Latest" }),
    ).toHaveAccessibleDescription("Not ordered: the log is busy.");
  });

  describe("before scripts take over", () => {
    it("draws each filter as a disclosure of links, marking the values in force", () => {
      const { container } = renderHeader({ hydrated: false });
      const disclosure = container.querySelector("details.menu");
      expect(disclosure?.querySelector("summary")).toHaveTextContent(
        "Reviewer",
      );
      const links = within(disclosure as HTMLElement).getAllByRole("link", {
        hidden: true,
      });
      expect(links.map((link) => link.getAttribute("href"))).toEqual([
        "?actor=jane",
        "?",
      ]);
      expect(links[1]).toHaveAttribute("aria-current", "true");
      expect(links[0]).not.toHaveAttribute("aria-current");
    });

    it("lists no value that leads nowhere", () => {
      const { container } = renderHeader({
        hydrated: false,
        filters: [
          filter({
            options: [
              { value: "jane", label: "Jane Doe", applied: false, href: null },
              { value: "john", label: "John Roe", applied: false, href: "?" },
            ],
          }),
        ],
      });
      expect(
        [...(container.querySelectorAll(".options a") ?? [])].map(
          (link) => link.textContent,
        ),
      ).toEqual(["John Roe"]);
    });

    it("links the reset and the order control to the queries they lead to", () => {
      renderHeader({
        hydrated: false,
        reset: { onReset: () => {}, href: "?" },
      });
      expect(
        screen.getByRole("link", { name: "Reset filters" }),
      ).toHaveAttribute("href", "?");
      expect(screen.getByRole("link", { name: "Latest" })).toHaveAttribute(
        "href",
        "?sort=at",
      );
    });

    it("offers nothing that leads nowhere, without a location", () => {
      const { container } = renderHeader({
        hydrated: false,
        filters: [
          filter({
            options: [
              { value: "jane", label: "Jane Doe", applied: false, href: null },
            ],
          }),
        ],
        reset: { onReset: () => {}, href: null },
        order: order({ href: null }),
      });
      expect(container.querySelector(".filter")).toBeNull();
      expect(screen.queryByRole("link")).toBeNull();
    });

    const hydrate = async (focus: (container: HTMLElement) => void) => {
      const Hydrating = () => (
        <Header
          filters={[filter()]}
          reset={null}
          order={order()}
          hydrated={useIsHydrated()}
        />
      );
      const container = document.createElement("div");
      container.innerHTML = renderToString(<Hydrating />);
      document.body.append(container);
      onTestFinished(() => {
        container.remove();
      });
      focus(container);
      await act(async () => {
        const root = hydrateRoot(container, <Hydrating />);
        onTestFinished(() => {
          act(() => {
            root.unmount();
          });
        });
      });
    };

    it("hands focus from a link to the button replacing it", async () => {
      await hydrate((container) => {
        container.querySelector<HTMLElement>(".order a")?.focus();
      });
      expect(screen.getByRole("button", { name: "Latest" })).toHaveFocus();
    });

    it("hands focus from a filter's disclosure to its menu's button", async () => {
      await hydrate((container) => {
        container.querySelector<HTMLElement>("summary")?.focus();
      });
      expect(screen.getByRole("button", { name: "Reviewer" })).toHaveFocus();
    });
  });
});
