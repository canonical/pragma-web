/**
 * Focus handed from a link drawn before scripts to the button that takes
 * its place once they run, matched by name.
 */
import { renderHook } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import useLinkFocusHandoff from "./useLinkFocusHandoff.js";

/** A root holding a focused link, then the buttons that replace it. */
const createRoot = () => {
  const root = document.createElement("div");
  root.innerHTML = '<a href="?" aria-label="Remove status">x</a>';
  document.body.append(root);
  onTestFinished(() => root.remove());
  root.querySelector("a")?.focus();
  return root;
};

describe("useLinkFocusHandoff", () => {
  it("hands the link's focus to the button of the same name", () => {
    const root = createRoot();
    const { rerender } = renderHook(
      ({ hydrated }) =>
        useLinkFocusHandoff({ rootRef: { current: root }, hydrated }),
      { initialProps: { hydrated: false } },
    );
    root.innerHTML =
      '<button type="button">Other</button><button type="button" aria-label="Remove status">x</button>';
    rerender({ hydrated: true });
    expect(document.activeElement).toBe(root.querySelectorAll("button")[1]);
  });

  it("tells same-named links apart by their chip", () => {
    const root = document.createElement("div");
    root.innerHTML =
      '<span class="ds query-chip" id="a"><a href="?" aria-label="Clear memory">x</a></span><span class="ds query-chip" id="b"><a href="?" aria-label="Clear memory">x</a></span>';
    document.body.append(root);
    onTestFinished(() => root.remove());
    root.querySelectorAll("a")[1]?.focus();
    const { rerender } = renderHook(
      ({ hydrated }) =>
        useLinkFocusHandoff({ rootRef: { current: root }, hydrated }),
      { initialProps: { hydrated: false } },
    );
    root.innerHTML =
      '<span class="ds query-chip" id="a"><button aria-label="Clear memory">x</button></span><span class="ds query-chip" id="b"><button aria-label="Clear memory">x</button></span>';
    rerender({ hydrated: true });
    expect(document.activeElement).toBe(root.querySelectorAll("button")[1]);
  });

  it("moves nothing when no button takes the name, or no link held focus", () => {
    const root = createRoot();
    const { rerender } = renderHook(
      ({ hydrated }) =>
        useLinkFocusHandoff({ rootRef: { current: root }, hydrated }),
      { initialProps: { hydrated: false } },
    );
    root.innerHTML = '<button type="button">Other</button>';
    rerender({ hydrated: true });
    expect(document.activeElement).not.toBe(root.querySelector("button"));
    const elsewhere = document.createElement("div");
    document.body.append(elsewhere);
    onTestFinished(() => elsewhere.remove());
    const { rerender: again } = renderHook(
      ({ hydrated }) =>
        useLinkFocusHandoff({ rootRef: { current: elsewhere }, hydrated }),
      { initialProps: { hydrated: false } },
    );
    again({ hydrated: true });
    expect(document.activeElement).toBe(document.body);
  });
});
