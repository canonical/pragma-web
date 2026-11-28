import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Component from "./DropdownButton.js";

describe("DropdownButton hydration", () => {
  it("hydrates the button and its chevron with no mismatch", async () => {
    const ui = (
      <Component items={[{ url: "/docs", label: "Docs" }]}>View</Component>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    const chevron = container.querySelector(".chevron");
    const onRecoverableError = vi.fn();
    const root = await act(async () =>
      hydrateRoot(container, ui, { onRecoverableError }),
    );
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector(".chevron")).toBe(chevron);
    expect(container.querySelector("button")).toHaveAttribute(
      "aria-haspopup",
      "menu",
    );
    act(() => root.unmount());
    container.remove();
  });
});
