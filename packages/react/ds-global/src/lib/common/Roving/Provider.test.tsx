import { render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import Context from "./Context.js";
import Provider from "./Provider.js";

describe("RovingProvider", () => {
  it("renders its children and nothing else", () => {
    const { container } = render(
      <Provider activeItem="a" onActiveItemChange={vi.fn()}>
        <span>child</span>
      </Provider>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
    expect(container.innerHTML).toBe("<span>child</span>");
  });

  it("shares the active item and the change handler", () => {
    const onActiveItemChange = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider activeItem="b" onActiveItemChange={onActiveItemChange}>
        {children}
      </Provider>
    );
    const { result } = renderHook(() => useContext(Context), { wrapper });
    expect(result.current?.activeItem).toBe("b");
    result.current?.setActiveItem("c");
    expect(onActiveItemChange).toHaveBeenCalledWith("c");
  });
});
