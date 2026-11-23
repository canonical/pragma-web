import { act } from "@testing-library/react";
import type { ReactElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Component from "./IconButton.js";

/**
 * React 19 reports a structural mismatch through `onRecoverableError` and an
 * attribute mismatch only through `console.error`, so both are watched.
 */
describe("IconButton (hydration)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Server-renders `serverUi` and hydrates `clientUi` over it.
   *
   * @note Impure: adds a container to the body, spies on `console.error` and
   * mounts a root; `unmount` undoes the container and the root.
   */
  const hydrate = (serverUi: ReactElement, clientUi: ReactElement) => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(serverUi);
    document.body.appendChild(container);

    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(container, clientUi, { onRecoverableError });
    });
    const unmount = () => {
      act(() => {
        root?.unmount();
      });
      container.remove();
    };
    return { container, error, onRecoverableError, unmount };
  };

  it("hydrates the server HTML with no mismatch of any kind", () => {
    const ui = <Component icon="edit" aria-label="Edit" />;
    const { container, error, onRecoverableError, unmount } = hydrate(ui, ui);

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(container.querySelector("button")).toHaveAccessibleName("Edit");

    unmount();
  });

  it("would report an attribute mismatch through console.error", () => {
    // Control: shows the console.error spy catches an attribute mismatch.
    const { error, onRecoverableError, unmount } = hydrate(
      <Component icon="edit" aria-label="Edit" />,
      <Component icon="edit" aria-label="Rename" />,
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();

    unmount();
  });
});
