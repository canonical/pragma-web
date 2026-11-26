import type { LinkComponentProps } from "@canonical/react-ds-global";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FilterOptions from "./FilterOptions.js";
import type { FilterOptionsOption } from "./types.js";

/** Three statuses after "All", the second current. */
const words = (
  overrides: Partial<FilterOptionsOption> = {},
): FilterOptionsOption[] => [
  { value: "All", label: "All", current: false, ...overrides },
  {
    value: "deployed",
    label: "deployed",
    current: true,
    count: "12",
    ...overrides,
  },
  { value: "ready", label: "ready", current: false, count: "4", ...overrides },
];

describe("FilterOptions", () => {
  describe("the group", () => {
    it("is a group named by its label, which takes the root's props", () => {
      render(
        <FilterOptions
          label="Status"
          options={words()}
          className="extra"
          data-testid="options"
        />,
      );
      const group = screen.getByRole("group", { name: "Status" });
      expect(group).toHaveClass("ds", "filter-options", "extra");
      expect(group).toHaveAttribute("data-testid", "options");
      expect(within(group).getAllByRole("listitem")).toHaveLength(3);
    });
  });

  describe("a word without an address", () => {
    it("is a button that marks the current word, and chooses on a click", () => {
      const onSelect = vi.fn();
      render(<FilterOptions label="Status" options={words({ onSelect })} />);
      const deployed = screen.getByRole("button", {
        name: /^deployed\s?,\s?12$/,
      });
      expect(deployed).toHaveAttribute("aria-current", "true");
      expect(deployed).not.toHaveAttribute("aria-pressed");
      expect(screen.getByRole("button", { name: "All" })).not.toHaveAttribute(
        "aria-current",
      );
      fireEvent.click(deployed);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("says a word among several is pressed, not current", () => {
      render(
        <FilterOptions
          label="Tags"
          multiple
          options={[
            {
              value: "ex-gpu",
              label: "ex-gpu",
              current: true,
              onSelect: vi.fn(),
            },
            {
              value: "ex-ssd",
              label: "ex-ssd",
              current: false,
              onSelect: vi.fn(),
            },
          ]}
        />,
      );
      const gpu = screen.getByRole("button", { name: "ex-gpu" });
      expect(gpu).toHaveAttribute("aria-pressed", "true");
      expect(gpu).not.toHaveAttribute("aria-current");
      expect(screen.getByRole("button", { name: "ex-ssd" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  describe("what applies", () => {
    it("names the group with the host's words, and shows the Condition's mark, hidden", () => {
      const { container } = render(
        <FilterOptions
          label="Status"
          condition="exclusion"
          appliedLabel="none of 1"
          options={[
            { value: "ready", label: "ready", current: false },
            {
              value: "broken",
              label: "broken",
              current: false,
              excludedLabel: "broken, excluded",
              onSelect: vi.fn(),
            },
          ]}
        />,
      );
      expect(
        screen.getByRole("group", { name: "Status, none of 1" }),
      ).toBeInTheDocument();
      expect(
        container.querySelector('.label > .mark[data-condition="exclusion"]'),
      ).toHaveAttribute("aria-hidden", "true");
      const broken = screen.getByRole("button", { name: "broken, excluded" });
      expect(broken).toHaveClass("word", "excluded");
      expect(broken.querySelector(".mark")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(screen.getByRole("button", { name: "ready" })).not.toHaveClass(
        "excluded",
      );
    });
  });

  it("draws no mark for a condition while nothing is said to apply", () => {
    const { container } = render(
      <FilterOptions
        label="Status"
        condition="exclusion"
        options={[{ value: "ready", label: "ready", current: false }]}
      />,
    );
    expect(container.querySelector(".mark")).toBeNull();
    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
  });

  describe("a word with an address", () => {
    it("is a link, marked current", () => {
      render(
        <FilterOptions
          label="Status"
          options={words({ href: "?status=deployed" })}
        />,
      );
      expect(
        screen.getByRole("link", { name: /^deployed\s?,\s?12$/ }),
      ).toHaveAttribute("aria-current", "true");
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });

    it("renders through a router's link, with only the shared contract's props", () => {
      const RouterLink = ({
        href,
        className,
        children,
        "aria-current": current,
      }: LinkComponentProps) => (
        <a
          href={href}
          className={className}
          aria-current={current}
          data-router=""
        >
          {children}
        </a>
      );
      render(
        <FilterOptions
          label="Status"
          LinkComponent={RouterLink}
          options={[
            { value: "ready", label: "ready", current: true, href: "#ready" },
            {
              value: "broken",
              label: "broken",
              current: false,
              href: "#broken",
            },
          ]}
        />,
      );
      const ready = screen.getByRole("link", { name: "ready" });
      expect(ready).toHaveAttribute("data-router");
      // Without a choice in place, a click is the router's.
      const followed = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      ready.dispatchEvent(followed);
      expect(followed.defaultPrevented).toBe(false);
      expect(ready).toHaveAttribute("aria-current", "true");
      expect(ready).toHaveClass("word");
      expect(screen.getByRole("link", { name: "broken" })).not.toHaveAttribute(
        "aria-current",
      );
    });

    it("chooses in place through a router's link on a plain click, and leaves it a modified one", () => {
      const onSelect = vi.fn();
      const routed = vi.fn();
      const RouterLink = ({
        href,
        className,
        children,
      }: LinkComponentProps) => (
        <a
          href={href}
          className={className}
          onClick={(event) => {
            event.preventDefault();
            routed();
          }}
        >
          {children}
        </a>
      );
      render(
        <FilterOptions
          label="Status"
          LinkComponent={RouterLink}
          options={[
            {
              value: "ready",
              label: "ready",
              current: false,
              href: "#ready",
              onSelect,
            },
          ]}
        />,
      );
      const link = screen.getByRole("link", { name: "ready" });
      link.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(routed).not.toHaveBeenCalled();
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          ctrlKey: true,
        }),
      );
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(routed).toHaveBeenCalledTimes(1);
    });

    it("leaves a click to the browser where it chooses nothing in place", () => {
      render(
        <FilterOptions
          label="Status"
          options={[
            { value: "ready", label: "ready", current: false, href: "#ready" },
          ]}
        />,
      );
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      screen.getByRole("link", { name: "ready" }).dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it("chooses in place on a plain click, and leaves a modified one to the browser", () => {
      const onSelect = vi.fn();
      render(
        <FilterOptions
          label="Status"
          options={[
            {
              value: "ready",
              label: "ready",
              current: false,
              href: "#ready",
              onSelect,
            },
          ]}
        />,
      );
      const link = screen.getByRole("link", { name: "ready" });
      for (const init of [
        { ctrlKey: true },
        { metaKey: true },
        { shiftKey: true },
        { altKey: true },
        { button: 1 },
      ]) {
        const event = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          ...init,
        });
        link.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
      }
      expect(onSelect).not.toHaveBeenCalled();
      const plain = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(plain);
      expect(plain.defaultPrevented).toBe(true);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });
});
