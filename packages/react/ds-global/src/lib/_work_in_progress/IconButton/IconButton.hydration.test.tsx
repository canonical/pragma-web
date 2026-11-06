import { act } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Component from "./IconButton.js";

/**
 * The real server and client contract: the server HTML must hydrate with
 * no recoverable error (React 19 reports hydration mismatches through
 * `onRecoverableError`).
 */
describe("IconButton (hydration)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("hydrates the server HTML with no recoverable error", () => {
    const ui = <Component icon="edit" aria-label="Edit" />;

    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.appendChild(container);

    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(container, ui, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();

    expect(container.querySelector("button")).toHaveAccessibleName("Edit");

    act(() => {
      root?.unmount();
    });
    container.remove();
    expect(vi.getTimerCount()).toBe(0);
  });
});
