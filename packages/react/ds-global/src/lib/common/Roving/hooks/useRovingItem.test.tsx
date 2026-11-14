import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { type ReactNode, useState } from "react";
import { describe, expect, it, vi } from "vitest";
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
