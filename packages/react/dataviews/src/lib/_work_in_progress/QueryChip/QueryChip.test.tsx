import { fireEvent, render, screen } from "@testing-library/react";
import { type ReactNode, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RovingProvider } from "../../common/Roving/index.js";
import Entry from "./common/Entry/Entry.js";
import Segment from "./common/Segment/Segment.js";
import Component from "./QueryChip.js";

/** A roving toolbar whose stop starts on `initial` and follows every claim. */
const Toolbar = ({
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

/** The roving ids the chip's parts register, in document order. */
const listItems = (container: HTMLElement) =>
  [...container.querySelectorAll("[data-roving-item]")].map((item) =>
    item.getAttribute("data-roving-item"),
  );

describe("QueryChip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
      for (const name of ["unity", "criticality"]) {
        expect(root).not.toHaveAttribute(name);
      }
    });

    it("composes its parts in order, through fragments, inside the body", () => {
      const more = (
        <>
          <Component.Segment>and</Component.Segment>
          <Component.Segment>more</Component.Segment>
        </>
      );
      const nested = (
        <>
          {clause}
          {more}
        </>
      );
      const { container } = render(<Component>{nested}</Component>);
      expect(container.querySelector(".body")).toHaveTextContent(
        "statusis any ofdeployedandmore",
      );
    });

    it("passes through a child that is not a part", () => {
      render(
        <Component>
          <Component.Segment>status</Component.Segment>
          {"note"}
        </Component>,
      );
      expect(screen.getByText(/note/)).toBeInTheDocument();
    });

    it("marks a disabled chip on its root", () => {
      const { container } = render(<Component disabled>{clause}</Component>);
      expect(container.firstElementChild).toHaveAttribute(
        "data-disabled",
        "true",
      );
    });

    it("keeps a keyed Entry, and its focus, as parts settle before it", () => {
      const Draft = ({ settled }: { settled: string[] }) => (
        <Toolbar initial="chip:entry">
          <Component id="chip" label="status">
            <Component.Segment key="field" onActivate={vi.fn()}>
              status
            </Component.Segment>
            {settled.map((text) => (
              <Component.Segment key={text}>{text}</Component.Segment>
            ))}
            <Component.Entry
              key="entry"
              value=""
              onValueChange={vi.fn()}
              label="Value"
            />
          </Component>
        </Toolbar>
      );
      const { rerender } = render(<Draft settled={[]} />);
      const input = screen.getByRole("textbox");
      input.focus();
      rerender(<Draft settled={["is"]} />);
      expect(screen.getByRole("textbox")).toBe(input);
      expect(input).toHaveFocus();
    });

    it("attaches its parts", () => {
      expect(Component.Segment).toBe(Segment);
      expect(Component.Entry).toBe(Entry);
    });
  });

  describe("group", () => {
    it("names a group by the whole clause while a part is interactive", () => {
      render(
        <Toolbar initial="other">
          <Component id="chip" label="status is deployed">
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
            <Component.Segment>is deployed</Component.Segment>
          </Component>
        </Toolbar>,
      );
      expect(screen.getByRole("group")).toHaveAccessibleName(
        "status is deployed",
      );
    });

    it("is no group while no part is interactive, even in a toolbar", () => {
      render(
        <Toolbar initial="x">
          <Component id="chip" label="status is deployed">
            {clause}
          </Component>
        </Toolbar>,
      );
      expect(screen.queryByRole("group")).toBeNull();
    });

    it("requires a label while a part is interactive", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() =>
        render(
          <Toolbar initial="other">
            <Component id="chip">
              <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
            </Component>
          </Toolbar>,
        ),
      ).toThrow("`label` is required while a part is interactive");
    });
  });

  describe("in a roving toolbar", () => {
    it("is one item: its first Segment, as <id>", () => {
      const { container } = render(
        <Toolbar initial="chip">
          <Component
            id="chip"
            label="status is deployed"
            onRemove={vi.fn()}
            removeLabel="Remove"
          >
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
            <Component.Segment onActivate={vi.fn()}>is</Component.Segment>
            <Component.Segment onActivate={vi.fn()}>deployed</Component.Segment>
          </Component>
        </Toolbar>,
      );
      expect(listItems(container)).toEqual(["chip"]);
      expect(
        screen.getAllByRole("button").map((button) => button.tabIndex),
      ).toEqual([0, -1, -1, -1]);
    });

    it("is its Entry, as <id>:entry, while it holds one", () => {
      const { container } = render(
        <Toolbar initial="chip:entry">
          <Component id="chip" label="status">
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
            <Component.Entry value="" onValueChange={vi.fn()} label="Value" />
          </Component>
        </Toolbar>,
      );
      expect(listItems(container)).toEqual(["chip:entry"]);
      expect(screen.getByRole("button", { name: "status" })).toHaveAttribute(
        "tabindex",
        "-1",
      );
      expect(screen.getByRole("textbox")).toHaveAttribute("tabindex", "0");
    });

    it("is its remove control, as <id>:remove, while it is read-only", () => {
      const onRemove = vi.fn();
      const { container } = render(
        <Toolbar initial="other">
          <Component id="chip" onRemove={onRemove} removeLabel="Remove">
            {clause}
          </Component>
        </Toolbar>,
      );
      expect(listItems(container)).toEqual(["chip:remove"]);
      const remove = screen.getByRole("button", { name: "Remove" });
      expect(remove).toHaveAttribute("tabindex", "-1");
      fireEvent.focus(remove);
      expect(screen.getByRole("status")).toHaveTextContent("chip:remove");
      expect(remove).toHaveAttribute("tabindex", "0");
      fireEvent.click(remove);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("keeps an interactive chip's remove control out of the tab order", () => {
      render(
        <Toolbar initial="chip">
          <Component
            id="chip"
            label="status"
            onRemove={vi.fn()}
            removeLabel="Remove"
          >
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
          </Component>
        </Toolbar>,
      );
      expect(screen.getByRole("button", { name: "Remove" })).toHaveAttribute(
        "tabindex",
        "-1",
      );
    });

    it("reports one claim when its item takes focus", () => {
      const onActiveItemChange = vi.fn();
      render(
        <RovingProvider
          activeItem="other"
          onActiveItemChange={onActiveItemChange}
        >
          <Component id="chip" label="status">
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
          </Component>
        </RovingProvider>,
      );
      fireEvent.focus(screen.getByRole("button", { name: "status" }));
      expect(onActiveItemChange).toHaveBeenCalledTimes(1);
      expect(onActiveItemChange).toHaveBeenCalledWith("chip");
    });

    it("reports one claim when a read-only chip's remove control takes focus", () => {
      const onActiveItemChange = vi.fn();
      render(
        <RovingProvider
          activeItem="other"
          onActiveItemChange={onActiveItemChange}
        >
          <Component id="chip" onRemove={vi.fn()} removeLabel="Remove">
            {clause}
          </Component>
        </RovingProvider>,
      );
      fireEvent.focus(screen.getByRole("button", { name: "Remove" }));
      expect(onActiveItemChange).toHaveBeenCalledTimes(1);
    });

    it("joins the composite, so a move from one of its parts takes focus", () => {
      const Host = () => {
        const [activeItem, setActiveItem] = useState("first");
        return (
          <RovingProvider
            activeItem={activeItem}
            onActiveItemChange={setActiveItem}
          >
            <Component id="first" label="cpu is 4">
              <Component.Segment onActivate={vi.fn()}>cpu</Component.Segment>
              <Component.Segment onActivate={vi.fn()}>is 4</Component.Segment>
            </Component>
            <Component id="second" label="ram">
              <Component.Segment onActivate={vi.fn()}>ram</Component.Segment>
            </Component>
            <button type="button" onClick={() => setActiveItem("second")}>
              next
            </button>
          </RovingProvider>
        );
      };
      render(<Host />);
      // Focus on a part that is not the item, then the host's move.
      screen.getByRole("button", { name: "is 4" }).focus();
      fireEvent.click(screen.getByRole("button", { name: "next" }));
      expect(screen.getByRole("button", { name: "ram" })).toHaveFocus();
    });

    it("claims the stop for its first Segment when it is activated", () => {
      const onActivate = vi.fn();
      render(
        <Toolbar initial="other">
          <Component id="chip" label="status">
            <Component.Segment onActivate={onActivate}>
              status
            </Component.Segment>
          </Component>
        </Toolbar>,
      );
      fireEvent.click(screen.getByRole("button", { name: "status" }));
      expect(onActivate).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("status").textContent).toBe("chip");
    });

    it("registers no item while it is disabled", () => {
      const { container } = render(
        <Toolbar initial="chip">
          <Component
            id="chip"
            label="status"
            disabled
            onRemove={vi.fn()}
            removeLabel="Remove"
          >
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
          </Component>
          <Component
            id="read-only"
            disabled
            onRemove={vi.fn()}
            removeLabel="Remove read-only"
          >
            {clause}
          </Component>
        </Toolbar>,
      );
      expect(listItems(container)).toEqual([]);
    });

    it("focuses a chip added with its Entry holding the moved stop", () => {
      const Host = () => {
        const [activeItem, setActiveItem] = useState("first");
        return (
          <RovingProvider
            activeItem={activeItem}
            onActiveItemChange={setActiveItem}
          >
            <Component id="first" label="cpu">
              <Component.Segment onActivate={vi.fn()}>cpu</Component.Segment>
            </Component>
            {activeItem === "draft:entry" && (
              <Component id="draft" label="status">
                <Component.Segment onActivate={vi.fn()}>
                  status
                </Component.Segment>
                <Component.Entry
                  value=""
                  onValueChange={vi.fn()}
                  label="Value"
                />
              </Component>
            )}
            <button type="button" onClick={() => setActiveItem("draft:entry")}>
              add
            </button>
          </RovingProvider>
        );
      };
      render(<Host />);
      fireEvent.click(screen.getByRole("button", { name: "add" }));
      expect(screen.getByRole("textbox", { name: "Value" })).toHaveFocus();
    });

    it("focuses a chip added with its first Segment holding the moved stop", () => {
      const Host = () => {
        const [activeItem, setActiveItem] = useState("first");
        return (
          <RovingProvider
            activeItem={activeItem}
            onActiveItemChange={setActiveItem}
          >
            <Component id="first" label="cpu">
              <Component.Segment onActivate={vi.fn()}>cpu</Component.Segment>
            </Component>
            {activeItem === "added" && (
              <Component id="added" label="status">
                <Component.Segment onActivate={vi.fn()}>
                  status
                </Component.Segment>
              </Component>
            )}
            <button type="button" onClick={() => setActiveItem("added")}>
              add
            </button>
          </RovingProvider>
        );
      };
      render(<Host />);
      fireEvent.click(screen.getByRole("button", { name: "add" }));
      expect(screen.getByRole("button", { name: "status" })).toHaveFocus();
    });

    it("gives its item the stop when another part takes focus by pointer", () => {
      render(
        <Toolbar initial="other">
          <Component
            id="chip"
            label="status is deployed"
            onRemove={vi.fn()}
            removeLabel="Remove"
          >
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
            <Component.Segment onActivate={vi.fn()}>deployed</Component.Segment>
          </Component>
        </Toolbar>,
      );
      const deployed = screen.getByRole("button", { name: "deployed" });
      // Focus moves to the part, then its focus event runs.
      deployed.focus();
      fireEvent.focus(deployed);
      expect(screen.getByRole("status").textContent).toBe("chip");
      // The stop moves, but focus stays on the part the pointer chose.
      expect(deployed).toHaveFocus();
    });

    it("gives its Entry the stop when its remove control takes focus", () => {
      render(
        <Toolbar initial="other">
          <Component
            id="chip"
            label="status"
            onRemove={vi.fn()}
            removeLabel="Remove"
          >
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
            <Component.Entry value="" onValueChange={vi.fn()} label="Value" />
          </Component>
        </Toolbar>,
      );
      const remove = screen.getByRole("button", { name: "Remove" });
      remove.focus();
      fireEvent.focus(remove);
      expect(screen.getByRole("status")).toHaveTextContent("chip:entry");
      expect(remove).toHaveFocus();
    });

    it("claims no stop while it is disabled", () => {
      render(
        <Toolbar initial="other">
          <Component id="chip" label="status" disabled>
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
          </Component>
        </Toolbar>,
      );
      fireEvent.focus(screen.getByRole("button", { name: "status" }));
      expect(screen.getByRole("status")).toHaveTextContent("other");
    });

    it("requires an id", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() =>
        render(
          <Toolbar initial="x">
            <Component>{clause}</Component>
          </Toolbar>,
        ),
      ).toThrow("`id` is required inside a roving toolbar");
    });
  });

  describe("composition", () => {
    it("lives inside a roving toolbar while a part is interactive", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() =>
        render(
          <Component label="status">
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
          </Component>,
        ),
      ).toThrow("an interactive chip lives inside a roving toolbar");
    });

    it("holds at least one Segment", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() =>
        render(
          <Toolbar initial="other">
            <Component id="chip" label="status">
              <Component.Entry value="" onValueChange={vi.fn()} label="A" />
            </Component>
          </Toolbar>,
        ),
      ).toThrow("at least one QueryChip.Segment");
    });

    it("holds at most one Entry", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() =>
        render(
          <Toolbar initial="other">
            <Component id="chip" label="status">
              <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
              <Component.Entry value="" onValueChange={vi.fn()} label="A" />
              <Component.Entry value="" onValueChange={vi.fn()} label="B" />
            </Component>
          </Toolbar>,
        ),
      ).toThrow("at most one QueryChip.Entry");
    });

    it("needs onActivate on its first Segment while a part is interactive", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() =>
        render(
          <Toolbar initial="other">
            <Component id="chip" label="status is deployed">
              <Component.Segment>status</Component.Segment>
              <Component.Segment onActivate={vi.fn()}>
                deployed
              </Component.Segment>
            </Component>
          </Toolbar>,
        ),
      ).toThrow("the first Segment needs `onActivate`");
    });
  });

  describe("descriptions", () => {
    it("describes the first Segment by every other part at fault", () => {
      render(
        <Toolbar initial="other">
          <Component id="chip" label="status is deploying">
            <Component.Segment description="The field" onActivate={vi.fn()}>
              status
            </Component.Segment>
            <Component.Segment
              invalid
              description="Invalid: no such status"
              onActivate={vi.fn()}
            >
              deploying
            </Component.Segment>
            <Component.Entry
              value="x"
              onValueChange={vi.fn()}
              label="Value"
              invalid
              description="Invalid: not a number"
            />
          </Component>
        </Toolbar>,
      );
      expect(
        screen.getByRole("button", { name: "status" }),
      ).toHaveAccessibleDescription(
        "The field Invalid: no such status Invalid: not a number",
      );
      expect(
        screen.getByRole("button", { name: "deploying" }),
      ).toHaveAccessibleDescription("Invalid: no such status");
    });

    it("describes a refused read-only chip's remove control by its reason", () => {
      render(
        <Component
          criticality="error"
          onRemove={vi.fn()}
          removeLabel="Remove cpu"
        >
          <Component.Segment description="Refused: not indexed">
            cpu
          </Component.Segment>
        </Component>,
      );
      expect(
        screen.getByRole("button", { name: "Remove cpu" }),
      ).toHaveAccessibleDescription("Refused: not indexed");
    });

    it("leaves the reason to the first Segment while a part is interactive", () => {
      render(
        <Toolbar initial="other">
          <Component
            id="chip"
            criticality="error"
            label="cpu"
            onRemove={vi.fn()}
            removeLabel="Remove cpu"
          >
            <Component.Segment
              description="Refused: not indexed"
              onActivate={vi.fn()}
            >
              cpu
            </Component.Segment>
          </Component>
        </Toolbar>,
      );
      expect(
        screen.getByRole("button", { name: "Remove cpu" }),
      ).not.toHaveAttribute("aria-describedby");
      expect(
        screen.getByRole("button", { name: "cpu" }),
      ).toHaveAccessibleDescription("Refused: not indexed");
    });

    it("describes a read-only chip's remove control by its faults too", () => {
      render(
        <Component
          criticality="error"
          onRemove={vi.fn()}
          removeLabel="Remove cpu"
        >
          <Component.Segment invalid description="Refused: not indexed">
            cpu
          </Component.Segment>
          <Component.Segment invalid description="Invalid: not a number">
            x
          </Component.Segment>
        </Component>,
      );
      expect(
        screen.getByRole("button", { name: "Remove cpu" }),
      ).toHaveAccessibleDescription(
        "Refused: not indexed Invalid: not a number",
      );
    });

    it("reads a reason inline while nothing references it", () => {
      const { container } = render(
        <Component criticality="error">
          <Component.Segment description="Refused: not indexed">
            cpu
          </Component.Segment>
        </Component>,
      );
      const reason = screen.getByText("Refused: not indexed");
      expect(reason).toHaveClass("assistive");
      expect(reason).not.toHaveAttribute("hidden");
      expect(container.querySelector(".body")?.lastElementChild).toBe(reason);
    });

    it("points no description from a control that cannot take focus", () => {
      render(
        <Component
          criticality="error"
          disabled
          onRemove={vi.fn()}
          removeLabel="Remove cpu"
        >
          <Component.Segment description="Refused: not indexed">
            cpu
          </Component.Segment>
        </Component>,
      );
      expect(
        screen.getByRole("button", { name: "Remove cpu" }),
      ).not.toHaveAttribute("aria-describedby");
    });

    it("gives a disabled chip's first Segment no fault to speak", () => {
      render(
        <Toolbar initial="other">
          <Component id="chip" label="cpu is x" disabled>
            <Component.Segment onActivate={vi.fn()}>cpu</Component.Segment>
            <Component.Segment invalid description="Invalid: x">
              x
            </Component.Segment>
          </Component>
        </Toolbar>,
      );
      expect(screen.getByRole("button", { name: "cpu" })).not.toHaveAttribute(
        "aria-describedby",
      );
    });

    it("reads a reason inline while its only reference is disabled", () => {
      render(
        <Component
          criticality="error"
          disabled
          onRemove={vi.fn()}
          removeLabel="Remove cpu"
        >
          <Component.Segment description="Refused: not indexed">
            cpu
          </Component.Segment>
        </Component>,
      );
      expect(screen.getByText("Refused: not indexed")).toHaveClass("assistive");
    });

    it("reads a fault inline while every part is disabled", () => {
      render(
        <Toolbar initial="other">
          <Component id="chip" label="cpu is x" disabled>
            <Component.Segment onActivate={vi.fn()}>cpu</Component.Segment>
            <Component.Segment invalid description="Invalid: x">
              x
            </Component.Segment>
          </Component>
        </Toolbar>,
      );
      expect(screen.getByText("Invalid: x")).toHaveClass("assistive");
    });

    it("reads inline a description that is neither a reason nor a fault", () => {
      render(
        <Component onRemove={vi.fn()} removeLabel="Remove">
          <Component.Segment>cpu</Component.Segment>
          <Component.Segment description="In cores">4</Component.Segment>
        </Component>,
      );
      expect(screen.getByText("In cores")).toHaveClass("assistive");
    });

    it("builds description ids that hold no whitespace", () => {
      render(
        <Component onRemove={vi.fn()} removeLabel="Remove cpu">
          <Component.Segment key="the field" invalid description="Invalid: x">
            cpu
          </Component.Segment>
        </Component>,
      );
      const describedBy =
        screen
          .getByRole("button", { name: "Remove cpu" })
          .getAttribute("aria-describedby") ?? "";
      expect(describedBy).not.toMatch(/\s/);
      expect(document.getElementById(describedBy)).toHaveTextContent(
        "Invalid: x",
      );
    });

    it("gives a refused chip with no reason no description", () => {
      render(
        <Component criticality="error" onRemove={vi.fn()} removeLabel="Remove">
          <Component.Segment>cpu</Component.Segment>
        </Component>,
      );
      expect(
        screen.getByRole("button", { name: "Remove" }),
      ).not.toHaveAttribute("aria-describedby");
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

    it("lets onRemove keep the link from navigating", () => {
      const onRemove = vi.fn((event: { preventDefault: () => void }) =>
        event.preventDefault(),
      );
      render(
        <Component
          removeHref="#removed"
          onRemove={onRemove}
          removeLabel="Remove"
        >
          {clause}
        </Component>,
      );
      const isNotPrevented = fireEvent.click(
        screen.getByRole("link", { name: "Remove" }),
      );
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(isNotPrevented).toBe(false);
    });

    it("is a named link with removeHref alone, and no button", () => {
      render(
        <Component removeHref="#removed" removeLabel="Remove">
          {clause}
        </Component>,
      );
      const remove = screen.getByRole("link", { name: "Remove" });
      const onError = vi.fn();
      window.addEventListener("error", onError);
      fireEvent.click(remove);
      window.removeEventListener("error", onError);
      expect(onError).not.toHaveBeenCalled();
      expect(remove).toHaveAttribute("href", "#removed");
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("disabled", () => {
    it("disables the parts and the remove control, link or not", () => {
      const { container } = render(
        <Toolbar initial="chip:entry">
          <Component
            id="chip"
            label="status is"
            disabled
            removeHref="#removed"
            removeLabel="Remove"
          >
            <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
            <Component.Segment>is</Component.Segment>
            <Component.Entry value="" onValueChange={vi.fn()} label="Value" />
          </Component>
        </Toolbar>,
      );
      for (const button of screen.getAllByRole("button")) {
        expect(button).toBeDisabled();
      }
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(screen.queryByRole("link")).toBeNull();
      expect(
        container.querySelector(".ds.query-chip-segment[data-disabled]"),
      ).toHaveTextContent(/^is$/);
    });
  });
});
