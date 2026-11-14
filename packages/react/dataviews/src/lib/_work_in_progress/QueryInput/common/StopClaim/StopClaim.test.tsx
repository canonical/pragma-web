import { act, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { createRef, useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  RovingProvider,
  useRovingItem,
} from "../../../../common/Roving/index.js";
import StopClaim from "./StopClaim.js";

const Item = ({ id }: { id: string }): ReactElement => {
  const item = useRovingItem<HTMLButtonElement>({ id });
  return (
    <button type="button" {...item}>
      {id}
    </button>
  );
};

/** A composite whose host moves the stop, with StopClaim inside it. */
const Composite = ({
  activeItem,
  items,
  onActiveItemChange = () => {},
  isClaimingRef = { current: false },
}: {
  activeItem: string;
  items: string[];
  onActiveItemChange?: (id: string) => void;
  isClaimingRef?: { current: boolean };
}): ReactElement => {
  // Kept across renders, as QueryInput's own root ref is.
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef}>
      <RovingProvider
        activeItem={activeItem}
        onActiveItemChange={onActiveItemChange}
      >
        <StopClaim rootRef={rootRef} isClaimingRef={isClaimingRef} />
        {items.map((id) => (
          <Item key={id} id={id} />
        ))}
      </RovingProvider>
    </div>
  );
};

const waitForNextTask = () =>
  act(() => new Promise((resolve) => setTimeout(resolve)));

describe("StopClaim", () => {
  it("claims a move once focus has left for the page, so focus stays there", async () => {
    const isClaimingRef = { current: false };
    const onActiveItemChange = vi.fn(() => {
      expect(isClaimingRef.current).toBe(true);
    });
    const view = render(
      <Composite
        activeItem="a"
        items={["a", "b"]}
        onActiveItemChange={onActiveItemChange}
        isClaimingRef={isClaimingRef}
      />,
    );
    act(() => screen.getByRole("button", { name: "a" }).focus());
    act(() => screen.getByRole("button", { name: "a" }).blur());
    await waitForNextTask();
    view.rerender(
      <Composite
        activeItem="b"
        items={["a", "b"]}
        onActiveItemChange={onActiveItemChange}
        isClaimingRef={isClaimingRef}
      />,
    );
    await waitForNextTask();
    expect(document.body).toHaveFocus();
    expect(onActiveItemChange).toHaveBeenCalledWith("b");
    expect(isClaimingRef.current).toBe(false);
  });

  it("claims a move once focus has gone elsewhere on the page", () => {
    const outside = document.body.appendChild(document.createElement("button"));
    const onActiveItemChange = vi.fn();
    const view = render(
      <Composite
        activeItem="a"
        items={["a", "b"]}
        onActiveItemChange={onActiveItemChange}
      />,
    );
    act(() => screen.getByRole("button", { name: "a" }).focus());
    act(() => outside.focus());
    view.rerender(
      <Composite
        activeItem="b"
        items={["a", "b"]}
        onActiveItemChange={onActiveItemChange}
      />,
    );
    expect(outside).toHaveFocus();
    expect(onActiveItemChange).toHaveBeenCalledWith("b");
    outside.remove();
  });

  it("leaves a move after a removal unclaimed, so the next item takes focus", async () => {
    const onActiveItemChange = vi.fn();
    const view = render(
      <Composite
        activeItem="a"
        items={["a", "b"]}
        onActiveItemChange={onActiveItemChange}
      />,
    );
    act(() => screen.getByRole("button", { name: "a" }).focus());
    view.rerender(
      <Composite
        activeItem="b"
        items={["b"]}
        onActiveItemChange={onActiveItemChange}
      />,
    );
    await waitForNextTask();
    expect(screen.getByRole("button", { name: "b" })).toHaveFocus();
    expect(onActiveItemChange).not.toHaveBeenCalled();
  });

  it("leaves a move after a removal that fired focusout unclaimed, as in Chromium", async () => {
    const onActiveItemChange = vi.fn();
    const view = render(
      <Composite
        activeItem="a"
        items={["a", "b"]}
        onActiveItemChange={onActiveItemChange}
      />,
    );
    const a = screen.getByRole("button", { name: "a" });
    act(() => a.focus());
    // Chromium fires focusout, the element still attached, as it is removed.
    act(() => {
      a.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: null }),
      );
    });
    view.rerender(
      <Composite
        activeItem="a"
        items={["b"]}
        onActiveItemChange={onActiveItemChange}
      />,
    );
    await waitForNextTask();
    view.rerender(
      <Composite
        activeItem="b"
        items={["b"]}
        onActiveItemChange={onActiveItemChange}
      />,
    );
    await waitForNextTask();
    expect(onActiveItemChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "b" })).toHaveFocus();
  });

  it("leaves a move with focus inside to the items", () => {
    const onActiveItemChange = vi.fn();
    const view = render(
      <Composite
        activeItem="a"
        items={["a", "b"]}
        onActiveItemChange={onActiveItemChange}
      />,
    );
    act(() => screen.getByRole("button", { name: "a" }).focus());
    view.rerender(
      <Composite
        activeItem="b"
        items={["a", "b"]}
        onActiveItemChange={onActiveItemChange}
      />,
    );
    // The items move focus for an unclaimed move, and it is not reported.
    expect(screen.getByRole("button", { name: "b" })).toHaveFocus();
    expect(onActiveItemChange).not.toHaveBeenCalled();
  });

  it("does nothing outside a roving composite", () => {
    const rootRef = createRef<HTMLDivElement>();
    const Outside = (): ReactElement => (
      <div ref={rootRef}>
        <button type="button">Outside</button>
        <StopClaim rootRef={rootRef} isClaimingRef={{ current: false }} />
      </div>
    );
    const view = render(<Outside />);
    const button = screen.getByRole("button", { name: "Outside" });
    act(() => button.focus());
    expect(() => view.rerender(<Outside />)).not.toThrow();
    expect(button).toHaveFocus();
  });
});
