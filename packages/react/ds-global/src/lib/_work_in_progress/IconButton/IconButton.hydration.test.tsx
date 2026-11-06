import { act } from "@testing-library/react";
import type { ReactElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Component from "./IconButton.js";

/**
 * The real server and client contract: the server HTML must hydrate
 * cleanly. React 19 reports the two kinds of mismatch in two places: a
 * structural one through `onRecoverableError`, and an attribute one (a
 * class, an aria-* value) only through `console.error` in development, so
 * the test listens to both.
 */
describe("IconButton (hydration)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Server-render `serverUi`, hydrate `clientUi` over it, and report.
   *
   * @note Impure: appends a container to `document.body`, replaces
   * `console.error` with a spy and mounts a React root. The returned
   * `unmount` unmounts the root and removes the container; the spy is
   * restored after each case.
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
    // The control for the case above: a server and a client that disagree
    // on one attribute are caught by the console.error spy, so its silence
    // there means something.
    const { error, onRecoverableError, unmount } = hydrate(
      <Component icon="edit" aria-label="Edit" />,
      <Component icon="edit" aria-label="Rename" />,
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();

    unmount();
  });
});
