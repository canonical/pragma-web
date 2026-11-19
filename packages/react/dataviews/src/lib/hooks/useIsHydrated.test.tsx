import { act, renderHook } from "@testing-library/react";
import type { ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished } from "vitest";
import useIsHydrated from "./useIsHydrated.js";

/** The hook's answer, written out. */
const ShowHydrated = (): ReactElement => <p>{String(useIsHydrated())}</p>;

describe("useIsHydrated", () => {
  it("is true in a client render with nothing to hydrate", () => {
    const { result } = renderHook(() => useIsHydrated());
    expect(result.current).toBe(true);
  });

  it("is false on the server", () => {
    expect(renderToString(<ShowHydrated />)).toBe("<p>false</p>");
  });

  it("turns true once hydrated", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ShowHydrated />);
    document.body.append(container);
    const root = await act(async () =>
      hydrateRoot(container, <ShowHydrated />),
    );
    onTestFinished(() => {
      act(() => {
        root.unmount();
      });
      container.remove();
    });
    expect(container.textContent).toBe("true");
  });
});
