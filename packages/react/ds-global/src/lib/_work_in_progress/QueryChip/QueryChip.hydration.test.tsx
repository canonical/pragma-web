import { act } from "@testing-library/react";
import type { ReactElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RovingProvider } from "../../common/Roving/index.js";
import Component from "./QueryChip.js";

/**
 * React 19 reports a structural mismatch through `onRecoverableError` and an
 * attribute mismatch only through `console.error`, so both are watched.
 */
describe("QueryChip (hydration)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Server-renders `ui` and hydrates the same element over it.
   *
   * @note Impure: adds a container to the body, spies on `console.error` and
   * mounts a root; `unmount` undoes the container and the root.
   */
  const hydrate = (ui: ReactElement) => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.appendChild(container);

    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(container, ui, { onRecoverableError });
    });
    const unmount = () => {
      act(() => {
        root?.unmount();
      });
      container.remove();
    };
    return { container, error, onRecoverableError, unmount };
  };

  it("hydrates, then turns its parts into roving items", () => {
    const { container, error, onRecoverableError, unmount } = hydrate(
      <RovingProvider activeItem="chip:entry" onActiveItemChange={vi.fn()}>
        <Component
          id="chip"
          label="status is"
          onRemove={vi.fn()}
          removeLabel="Remove"
        >
          <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
          <Component.Segment condition="inclusion" description="The operator">
            is
          </Component.Segment>
          <Component.Entry value="" onValueChange={vi.fn()} label="Value" />
        </Component>
      </RovingProvider>,
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(container.querySelector('[role="group"]')).toHaveAccessibleName(
      "status is",
    );
    expect(
      [...container.querySelectorAll("[data-roving-item]")].map(
        (item) => (item as HTMLElement).tabIndex,
      ),
    ).toEqual([-1, 0, -1]);
    expect(container.querySelector("button.remove")).toBeEnabled();

    unmount();
  });

  it("hydrates a read-only chip with a remove link", () => {
    const { container, error, onRecoverableError, unmount } = hydrate(
      <Component removeHref="#removed" removeLabel="Remove web">
        <Component.Segment>web</Component.Segment>
      </Component>,
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("a.remove")).toHaveAttribute(
      "href",
      "#removed",
    );

    unmount();
  });
});
