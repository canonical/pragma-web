import { render, screen } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import installPopoverStandIn from "../../../../../../testing/installPopoverStandIn.js";
import useSuggestions from "../../hooks/useSuggestions.js";
import type { QueryInputOption } from "../types.js";
import Suggestions from "./Suggestions.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());
afterEach(() => vi.unstubAllGlobals());

const OPTIONS: QueryInputOption[] = [{ id: "status", label: "status" }];

/** The suggestions with their combobox, open or closed. */
const Harness = ({
  isOpen,
  loading = false,
  options = OPTIONS,
}: {
  isOpen: boolean;
  loading?: boolean;
  options?: QueryInputOption[];
}) => {
  const suggestions = useSuggestions({
    options,
    value: "",
    loading,
    hasEmptyText: true,
    hasFooter: true,
    isMounted: true,
    disabled: false,
    baseId: "q",
    rootRef: { current: null },
  });
  return (
    <>
      <input
        {...suggestions.getEntryProps("own", { "aria-label": "Filter" })}
      />
      <Suggestions
        anchorName={suggestions.anchorName}
        footerId={suggestions.footerId}
        getMenuProps={suggestions.getMenuProps}
        getItemProps={suggestions.getItemProps}
        isOpen={isOpen}
        label="Filter"
        options={options}
        loading={loading}
        emptyText="No matches"
        footer="Separate values with commas"
      />
    </>
  );
};

describe("Suggestions", () => {
  it("names the held option as current, and keeps it unavailable", () => {
    render(
      <Harness
        isOpen
        options={[
          { id: "deployed", label: "deployed", current: true },
          { id: "ready", label: "ready" },
        ]}
      />,
    );
    const held = screen.getByRole("option", { hidden: true, name: "deployed" });
    expect(held).toHaveAttribute("aria-current", "true");
    expect(held).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("option", { hidden: true, name: "ready" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("is a manual popover on a raised surface, anchored to the entry", () => {
    const { container } = render(<Harness isOpen={false} />);
    const popover = container.querySelector(
      ".query-input-suggestions",
    ) as HTMLElement;
    expect(popover).toHaveAttribute("popover", "manual");
    expect(popover).toHaveClass("surface");
    expect(popover.style.getPropertyValue("position-anchor")).toBe(
      "--query-input-q",
    );
    expect(popover.matches(":popover-open")).toBe(false);
  });

  it("shows and hides with isOpen, placed under the focused entry without anchor positioning", () => {
    vi.stubGlobal("CSS", { supports: () => false });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      left: 12,
    } as DOMRect);
    const { container, rerender } = render(<Harness isOpen={false} />);
    screen.getByRole("combobox").focus();
    const popover = container.querySelector(
      ".query-input-suggestions",
    ) as HTMLElement;
    rerender(<Harness isOpen />);
    expect(popover.matches(":popover-open")).toBe(true);
    expect(popover.style.top).toBe("40px");
    expect(popover.style.left).toBe("12px");
    rerender(<Harness isOpen />);
    rerender(<Harness isOpen={false} />);
    expect(popover.matches(":popover-open")).toBe(false);
    vi.restoreAllMocks();
  });

  it("follows the focused entry while it stays open", () => {
    vi.stubGlobal("CSS", { supports: () => false });
    const box = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ bottom: 40, left: 12 } as DOMRect);
    const { container, rerender } = render(<Harness isOpen={false} />);
    screen.getByRole("combobox").focus();
    rerender(<Harness isOpen />);
    box.mockReturnValue({ bottom: 40, left: 90 } as DOMRect);
    rerender(<Harness isOpen />);
    const popover = container.querySelector(
      ".query-input-suggestions",
    ) as HTMLElement;
    expect(popover.style.left).toBe("90px");
    vi.restoreAllMocks();
  });

  it("flips above the entry without room below, clamps to the viewport and follows a scroll", () => {
    vi.stubGlobal("CSS", { supports: () => false });
    const box = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ top: 700, bottom: 730, left: 900 } as DOMRect);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(300);
    const { container, rerender } = render(<Harness isOpen={false} />);
    screen.getByRole("combobox").focus();
    rerender(<Harness isOpen />);
    const popover = container.querySelector(
      ".query-input-suggestions",
    ) as HTMLElement;
    expect(popover.style.top).toBe("500px");
    expect(popover.style.left).toBe(`${window.innerWidth - 300}px`);
    box.mockReturnValue({ top: 40, bottom: 70, left: 10 } as DOMRect);
    window.dispatchEvent(new Event("scroll"));
    expect(popover.style.top).toBe("70px");
    expect(popover.style.left).toBe("10px");
    rerender(<Harness isOpen={false} />);
    vi.restoreAllMocks();
  });

  it("places the list by the entry's physical box in right-to-left text", () => {
    vi.stubGlobal("CSS", { supports: () => false });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 40,
      bottom: 70,
      left: 500,
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
    document.documentElement.dir = "rtl";
    const { container, rerender } = render(<Harness isOpen={false} />);
    screen.getByRole("combobox").focus();
    rerender(<Harness isOpen />);
    const popover = container.querySelector(
      ".query-input-suggestions",
    ) as HTMLElement;
    expect(popover.style.left).toBe("500px");
    expect(popover.style.insetInlineStart).toBe("");
    document.documentElement.dir = "";
    vi.restoreAllMocks();
  });

  it("stays under the entry when there is no room above either", () => {
    vi.stubGlobal("CSS", { supports: () => false });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 130,
      left: 0,
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(
      window.innerHeight,
    );
    const { container, rerender } = render(<Harness isOpen={false} />);
    screen.getByRole("combobox").focus();
    rerender(<Harness isOpen />);
    const popover = container.querySelector(
      ".query-input-suggestions",
    ) as HTMLElement;
    expect(popover.style.top).toBe("130px");
    vi.restoreAllMocks();
  });

  it("places the popover itself where the environment has no CSS object", () => {
    vi.stubGlobal("CSS", undefined);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      left: 12,
    } as DOMRect);
    const { container, rerender } = render(<Harness isOpen={false} />);
    screen.getByRole("combobox").focus();
    rerender(<Harness isOpen />);
    const popover = container.querySelector(
      ".query-input-suggestions",
    ) as HTMLElement;
    expect(popover.style.top).toBe("40px");
    vi.restoreAllMocks();
  });

  it("leaves placement to the stylesheet where anchor positioning exists", () => {
    vi.stubGlobal("CSS", { supports: () => true });
    const { container, rerender } = render(<Harness isOpen={false} />);
    rerender(<Harness isOpen />);
    const popover = container.querySelector(
      ".query-input-suggestions",
    ) as HTMLElement;
    expect(popover.style.top).toBe("");
  });

  it("places nothing when no element has focus", () => {
    vi.stubGlobal("CSS", { supports: () => false });
    const { container, rerender } = render(<Harness isOpen={false} />);
    (document.activeElement as HTMLElement | null)?.blur();
    vi.spyOn(document, "activeElement", "get").mockReturnValue(null);
    rerender(<Harness isOpen />);
    const popover = container.querySelector(
      ".query-input-suggestions",
    ) as HTMLElement;
    expect(popover.style.top).toBe("");
    vi.restoreAllMocks();
  });

  it("holds only options in its listbox, named by the label, and ties the footer", () => {
    render(<Harness isOpen={false} loading />);
    const listbox = screen.getByRole("listbox", {
      hidden: true,
      name: "Filter",
    });
    expect(listbox).toHaveAttribute("id", "q-listbox");
    expect(listbox.children).toHaveLength(1);
    expect(screen.getByText("Separate values with commas")).toHaveAttribute(
      "id",
      "q-footer",
    );
  });

  it("shows no empty text while loading", () => {
    const { container } = render(
      <Harness isOpen={false} options={[]} loading />,
    );
    expect(container.querySelector(".empty")).toBeNull();
    expect(container.querySelector(".loading")).not.toBeNull();
  });
});
