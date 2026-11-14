import { fireEvent, render, screen } from "@testing-library/react";
import { type ReactNode, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RovingProvider } from "../../common/Roving/index.js";
import Component from "./QueryChip.js";

/** A roving host whose stop starts on `initial` and follows every claim. */
const Roving = ({
  initial,
  children,
}: {
  initial: string;
  children: ReactNode;
}) => {
  const [activeItem, setActiveItem] = useState(initial);
  return (
    <RovingProvider activeItem={activeItem} onActiveItemChange={setActiveItem}>
      {children}
      <output>{activeItem}</output>
    </RovingProvider>
  );
};

const clause = (
  <>
    <Component.Segment>status</Component.Segment>
    <Component.Segment condition="inclusion">is any of</Component.Segment>
    <Component.Segment>deployed</Component.Segment>
  </>
);

describe("QueryChip", () => {
  describe("root", () => {
    it("renders a span with its classes, tone and unity", () => {
      const { container } = render(
        <Component criticality="warning" className="mine">
          {clause}
        </Component>,
      );
      expect(container.firstElementChild?.tagName).toBe("SPAN");
      expect(container.firstElementChild?.className).toBe(
        "ds query-chip warning separated mine",
      );
    });

    it("takes the joined unity", () => {
      const { container } = render(
        <Component unity="joined">{clause}</Component>,
      );
      expect(container.firstElementChild).toHaveClass("joined");
    });

    it("renders its id and forwards native props, leaking none of its own", () => {
      const onMouseEnter = vi.fn();
      render(
        <Component
          id="status"
          label="status is any of deployed"
          title="A clause"
          data-testid="chip"
          onMouseEnter={onMouseEnter}
        >
          {clause}
        </Component>,
      );
      const root = screen.getByTestId("chip");
      expect(root).toHaveAttribute("id", "status");
      expect(root).toHaveAttribute("title", "A clause");
      fireEvent.mouseEnter(root);
      expect(onMouseEnter).toHaveBeenCalled();
      for (const name of ["label", "unity", "criticality"]) {
        expect(root).not.toHaveAttribute(name);
      }
    });

    it("composes its parts in order inside the body", () => {
      const { container } = render(<Component>{clause}</Component>);
      expect(container.querySelector(".body")).toHaveTextContent(
        "statusis any ofdeployed",
      );
    });
  });

  describe("outside a roving toolbar", () => {
    it("keeps plain-text segments and no group", () => {
      render(
        <Component label="status is deployed">
          <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
        </Component>,
      );
      expect(screen.queryByRole("button")).toBeNull();
      expect(screen.queryByRole("group")).toBeNull();
    });
  });

  describe("in a roving toolbar", () => {
    it("names a group by the whole clause", () => {
      render(
        <Roving initial="x">
          <Component id="chip" label="status is any of deployed">
            {clause}
          </Component>
        </Roving>,
      );
      expect(screen.getByRole("group")).toHaveAccessibleName(
        "status is any of deployed",
      );
    });

    it("prefixes its parts' roving ids with its id", () => {
      const { container } = render(
        <Roving initial="x">
          <Component id="chip" onRemove={vi.fn()} removeLabel="Remove">
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
            <Component.Entry value="" onValueChange={vi.fn()} label="Value" />
          </Component>
        </Roving>,
      );
      const ids = [...container.querySelectorAll("[data-roving-item]")].map(
        (item) => item.getAttribute("data-roving-item"),
      );
      expect(ids).toHaveLength(3);
      expect(ids.every((id) => id?.startsWith("chip:"))).toBe(true);
      expect(ids.slice(1)).toEqual(["chip:entry", "chip:remove"]);
    });

    it("requires an id", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() =>
        render(
          <Roving initial="x">
            <Component>{clause}</Component>
          </Roving>,
        ),
      ).toThrow("`id` is required inside a roving toolbar");
      vi.restoreAllMocks();
    });
  });

  describe("remove control", () => {
    it("is absent without a label", () => {
      const { container } = render(<Component>{clause}</Component>);
      expect(container.querySelector(".remove")).toBeNull();
    });

    it("is a button that calls onRemove once scripts run", () => {
      const onRemove = vi.fn();
      render(
        <Component onRemove={onRemove} removeLabel="Remove status">
          {clause}
        </Component>,
      );
      const remove = screen.getByRole("button", { name: "Remove status" });
      expect(remove).toBeEnabled();
      expect(remove).toHaveAttribute("type", "button");
      expect(remove).not.toHaveAttribute("tabindex");
      expect(remove.querySelector("svg use")).toHaveAttribute(
        "href",
        "/icons/close.svg#close",
      );
      fireEvent.click(remove);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("is a link with removeHref, whose click still calls onRemove", () => {
      const onRemove = vi.fn();
      render(
        <Component
          removeHref="#removed"
          onRemove={onRemove}
          removeLabel="Remove status"
        >
          {clause}
        </Component>,
      );
      const remove = screen.getByRole("link", { name: "Remove status" });
      expect(remove).toHaveAttribute("href", "#removed");
      fireEvent.click(remove);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("is a link with removeHref alone", () => {
      render(
        <Component removeHref="#removed" removeLabel="Remove">
          {clause}
        </Component>,
      );
      expect(() => fireEvent.click(screen.getByRole("link"))).not.toThrow();
    });

    it("is a roving item in a toolbar, as <id>:remove", () => {
      const onRemove = vi.fn();
      render(
        <Roving initial="other">
          <Component id="chip" onRemove={onRemove} removeLabel="Remove">
            {clause}
          </Component>
        </Roving>,
      );
      const remove = screen.getByRole("button", { name: "Remove" });
      expect(remove).toHaveAttribute("tabindex", "-1");
      fireEvent.focus(remove);
      expect(screen.getByRole("status")).toHaveTextContent("chip:remove");
      expect(remove).toHaveAttribute("tabindex", "0");
      fireEvent.click(remove);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe("disabled", () => {
    it("disables the parts and the remove control, link or not", () => {
      const { container } = render(
        <Roving initial="x">
          <Component
            id="chip"
            disabled
            removeHref="#removed"
            removeLabel="Remove"
          >
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
            <Component.Segment>is</Component.Segment>
            <Component.Entry value="" onValueChange={vi.fn()} label="Value" />
          </Component>
        </Roving>,
      );
      for (const button of screen.getAllByRole("button")) {
        expect(button).toBeDisabled();
      }
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(screen.queryByRole("link")).toBeNull();
      expect(container.querySelector("[data-disabled]")).toHaveTextContent(
        "is",
      );
    });
  });

  it("attaches its parts", () => {
    expect(Component.Segment).toBeTypeOf("function");
    expect(Component.Entry).toBeTypeOf("function");
  });
});
