import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { createRef, type ReactNode, useContext, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import Context from "../Context.js";
import Provider from "../Provider.js";
import useRovingItem from "./useRovingItem.js";

/** A button that is one roving item. */
const Item = ({ id }: { id: string }) => {
  const item = useRovingItem({ id });
  return (
    <button type="button" {...item}>
      {id}
    </button>
  );
};

/** A composite of three items whose host moves the stop with a button. */
const Composite = () => {
  const [activeItem, setActiveItem] = useState("a");
  return (
    <>
      <Provider activeItem={activeItem} onActiveItemChange={setActiveItem}>
        <Item id="a" />
        <Item id="b" />
        <Item id="c" />
      </Provider>
      <output>{activeItem}</output>
      <button type="button" onClick={() => setActiveItem("c")}>
        move to c
      </button>
    </>
  );
};

describe("useRovingItem", () => {
  describe("outside a roving context", () => {
    it("returns nothing", () => {
      const { result } = renderHook(() => useRovingItem({ id: "a" }));
      expect(result.current).toBeUndefined();
    });
  });

  describe("while the element is not an item", () => {
    it("returns nothing inside a roving context", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider activeItem="a" onActiveItemChange={vi.fn()}>
          {children}
        </Provider>
      );
      const { result } = renderHook(() => useRovingItem({ id: undefined }), {
        wrapper,
      });
      expect(result.current).toBeUndefined();
    });
  });

  describe("inside a roving context", () => {
    it("gives the tab stop to the active item only", () => {
      render(<Composite />);
      expect(screen.getByRole("button", { name: "a" })).toHaveAttribute(
        "tabindex",
        "0",
      );
      expect(screen.getByRole("button", { name: "b" })).toHaveAttribute(
        "tabindex",
        "-1",
      );
      expect(screen.getByRole("button", { name: "c" })).toHaveAttribute(
        "tabindex",
        "-1",
      );
    });

    it("marks each item with its id, for a host walking the document", () => {
      const { container } = render(<Composite />);
      expect(
        [...container.querySelectorAll("[data-roving-item]")].map((item) =>
          item.getAttribute("data-roving-item"),
        ),
      ).toEqual(["a", "b", "c"]);
    });

    it("does not take focus when it mounts holding the stop", () => {
      render(<Composite />);
      expect(document.body).toHaveFocus();
    });

    it("claims the stop when it takes focus", () => {
      render(<Composite />);
      fireEvent.focus(screen.getByRole("button", { name: "b" }));
      expect(screen.getByRole("status")).toHaveTextContent("b");
      expect(screen.getByRole("button", { name: "b" })).toHaveAttribute(
        "tabindex",
        "0",
      );
    });

    it("claims the stop when it is clicked", () => {
      render(<Composite />);
      fireEvent.click(screen.getByRole("button", { name: "c" }));
      expect(screen.getByRole("status")).toHaveTextContent("c");
    });

    it("does not report a claim when it already holds the stop", () => {
      const onActiveItemChange = vi.fn();
      render(
        <Provider activeItem="a" onActiveItemChange={onActiveItemChange}>
          <Item id="a" />
        </Provider>,
      );
      const button = screen.getByRole("button", { name: "a" });
      fireEvent.focus(button);
      fireEvent.click(button);
      expect(onActiveItemChange).not.toHaveBeenCalled();
    });

    it("takes focus when the host moves the stop onto it", () => {
      render(<Composite />);
      fireEvent.click(screen.getByRole("button", { name: "move to c" }));
      expect(screen.getByRole("button", { name: "c" })).toHaveFocus();
    });

    it("moves only the stop while focus is outside the composite", () => {
      render(
        <>
          <input aria-label="elsewhere" />
          <Composite />
        </>,
      );
      const elsewhere = screen.getByRole("textbox", { name: "elsewhere" });
      elsewhere.focus();
      fireEvent.click(screen.getByRole("button", { name: "move to c" }));
      expect(elsewhere).toHaveFocus();
      expect(screen.getByRole("button", { name: "c" })).toHaveAttribute(
        "tabindex",
        "0",
      );
    });

    it("takes focus from another item when the host moves the stop", () => {
      render(<Composite />);
      screen.getByRole("button", { name: "a" }).focus();
      fireEvent.click(screen.getByRole("button", { name: "move to c" }));
      expect(screen.getByRole("button", { name: "c" })).toHaveFocus();
    });

    it("takes focus when it mounts holding a stop that has moved", () => {
      // A host swaps one item for another and moves the stop onto it in the
      // same update, as when a segment is swapped for an entry.
      const Swapping = () => {
        const [activeItem, setActiveItem] = useState("a");
        return (
          <Provider activeItem={activeItem} onActiveItemChange={setActiveItem}>
            {activeItem === "a" ? <Item id="a" /> : <Item id="entry" />}
            <button type="button" onClick={() => setActiveItem("entry")}>
              swap
            </button>
          </Provider>
        );
      };
      render(<Swapping />);
      fireEvent.click(screen.getByRole("button", { name: "swap" }));
      expect(screen.getByRole("button", { name: "entry" })).toHaveFocus();
    });

    it("takes focus when it becomes the item the stop has moved onto", () => {
      const RenamedItem = ({ isItem }: { isItem: boolean }) => {
        const item = useRovingItem({ id: isItem ? "b" : undefined });
        return (
          <button type="button" {...item}>
            renamed
          </button>
        );
      };
      const Renaming = () => {
        const [activeItem, setActiveItem] = useState("a");
        return (
          <Provider activeItem={activeItem} onActiveItemChange={setActiveItem}>
            <RenamedItem isItem={activeItem === "b"} />
            <button type="button" onClick={() => setActiveItem("b")}>
              move
            </button>
          </Provider>
        );
      };
      render(<Renaming />);
      fireEvent.click(screen.getByRole("button", { name: "move" }));
      expect(screen.getByRole("button", { name: "renamed" })).toHaveFocus();
    });

    it("takes focus once its element attaches, if the stop arrived first", () => {
      // The item mounts holding a moved stop before it renders its element,
      // as a part does that becomes a button only once scripts run.
      const Late = () => {
        const [isShown, setIsShown] = useState(false);
        const item = useRovingItem({ id: "late" });
        return isShown ? (
          <button type="button" {...item}>
            late
          </button>
        ) : (
          <button type="button" onClick={() => setIsShown(true)}>
            show
          </button>
        );
      };
      const Host = () => {
        const [activeItem, setActiveItem] = useState("a");
        return (
          <Provider activeItem={activeItem} onActiveItemChange={setActiveItem}>
            {activeItem === "late" ? <Late /> : null}
            <button type="button" onClick={() => setActiveItem("late")}>
              add
            </button>
          </Provider>
        );
      };
      render(<Host />);
      fireEvent.click(screen.getByRole("button", { name: "add" }));
      fireEvent.click(screen.getByRole("button", { name: "show" }));
      expect(screen.getByRole("button", { name: "late" })).toHaveFocus();
    });

    it("leaves focus where it is when the stop arrives through a claim", () => {
      // A part of a composite claims the stop for the composite's item.
      const Claimant = () => {
        const context = useContext(Context);
        return (
          <button type="button" onFocus={() => context?.setActiveItem("c")}>
            claimant
          </button>
        );
      };
      const Host = () => {
        const [activeItem, setActiveItem] = useState("a");
        return (
          <Provider activeItem={activeItem} onActiveItemChange={setActiveItem}>
            <Item id="c" />
            <Claimant />
          </Provider>
        );
      };
      render(<Host />);
      const claimant = screen.getByRole("button", { name: "claimant" });
      claimant.focus();
      fireEvent.focus(claimant);
      expect(claimant).toHaveFocus();
      expect(screen.getByRole("button", { name: "c" })).toHaveAttribute(
        "tabindex",
        "0",
      );
    });

    it("drops a pending arrival when the stop leaves before the element attaches", () => {
      const Late = ({ isShown }: { isShown: boolean }) => {
        const item = useRovingItem({ id: "late" });
        return isShown ? (
          <button type="button" {...item}>
            late
          </button>
        ) : null;
      };
      const Host = () => {
        const [activeItem, setActiveItem] = useState("a");
        const [isShown, setIsShown] = useState(false);
        return (
          <Provider activeItem={activeItem} onActiveItemChange={setActiveItem}>
            <Late isShown={isShown} />
            <button type="button" onClick={() => setActiveItem("late")}>
              arrive
            </button>
            <button type="button" onClick={() => setActiveItem("a")}>
              leave
            </button>
            <button type="button" onClick={() => setIsShown(true)}>
              show
            </button>
          </Provider>
        );
      };
      render(<Host />);
      fireEvent.click(screen.getByRole("button", { name: "arrive" }));
      fireEvent.click(screen.getByRole("button", { name: "leave" }));
      const show = screen.getByRole("button", { name: "show" });
      show.focus();
      fireEvent.click(show);
      expect(screen.getByRole("button", { name: "late" })).not.toHaveFocus();
    });

    it("composes the host's ref and handlers with its own", () => {
      const onFocus = vi.fn();
      const onClick = vi.fn();
      const objectRef = createRef<HTMLButtonElement>();
      const callbackRef = vi.fn();
      const Hosted = ({
        id,
        refKind,
      }: {
        id: string;
        refKind: "object" | "callback";
      }) => {
        const item = useRovingItem<HTMLButtonElement>({
          id,
          ref: refKind === "object" ? objectRef : callbackRef,
          onFocus,
          onClick,
        });
        return (
          <button type="button" {...item}>
            {id}
          </button>
        );
      };
      const onActiveItemChange = vi.fn();
      render(
        <Provider activeItem="a" onActiveItemChange={onActiveItemChange}>
          <Hosted id="object" refKind="object" />
          <Hosted id="callback" refKind="callback" />
        </Provider>,
      );
      const object = screen.getByRole("button", { name: "object" });
      expect(objectRef.current).toBe(object);
      expect(callbackRef).toHaveBeenCalledWith(
        screen.getByRole("button", { name: "callback" }),
      );
      fireEvent.focus(object);
      fireEvent.click(object);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onActiveItemChange).toHaveBeenCalledWith("object");
    });

    it("takes no focus when the stop moves onto an item with no element", () => {
      const Detached = () => {
        useRovingItem({ id: "b" });
        return null;
      };
      const Host = ({ children }: { children: ReactNode }) => {
        const [activeItem, setActiveItem] = useState("a");
        return (
          <>
            <Provider activeItem={activeItem} onActiveItemChange={vi.fn()}>
              {children}
            </Provider>
            <button type="button" onClick={() => setActiveItem("b")}>
              move
            </button>
          </>
        );
      };
      render(
        <Host>
          <Detached />
        </Host>,
      );
      const move = screen.getByRole("button", { name: "move" });
      move.focus();
      fireEvent.click(move);
      expect(move).toHaveFocus();
    });
  });
});
