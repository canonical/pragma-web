import { act } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Component from "./IconButton.js";

/**
 * The real server and client contract, with no `createPortal` mock: the
 * server HTML must hydrate with no recoverable error (React 19 reports
 * hydration mismatches through `onRecoverableError`), and the Tooltip's
 * message must reach the document body only after mount.
 */
describe("IconButton (hydration)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // Fails until IconButton pairs itself with a Tooltip.
  it.fails("hydrates with no recoverable error and portals the Tooltip after mount", () => {
    const ui = <Component icon="edit" aria-label="Edit" />;

    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.appendChild(container);
    expect(container.querySelector('[role="tooltip"]')).toBeNull();

    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(container, ui, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();

    const message = document.body.querySelector(".ds.tooltip .text");
    expect(message?.textContent).toBe("Edit");
    expect(message?.closest(".ds.tooltip-area")).toBeNull();

    act(() => {
      root?.unmount();
    });
    container.remove();
    expect(vi.getTimerCount()).toBe(0);
  });
});
