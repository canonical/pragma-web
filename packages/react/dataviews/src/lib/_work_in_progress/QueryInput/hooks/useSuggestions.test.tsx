import { act, renderHook } from "@testing-library/react";
import type { FocusEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import type { UseSuggestionsProps } from "./types.js";
import useSuggestions from "./useSuggestions.js";

const props: UseSuggestionsProps = {
  options: [
    { id: "a", label: "a" },
    { id: "b", label: "b", disabled: true },
  ],
  value: "",
  loading: false,
  hasEmptyText: false,
  hasFooter: false,
  isMounted: false,
  disabled: false,
  baseId: ":r1:",
  rootRef: { current: null },
};

/** Renders the hook before scripts run, then after, as a page loads. */
const mount = (overrides: Partial<UseSuggestionsProps> = {}) => {
  const view = renderHook(
    (current: UseSuggestionsProps) => useSuggestions(current),
    {
      initialProps: { ...props, ...overrides },
    },
  );
  view.rerender({ ...props, ...overrides, isMounted: true });
  return view;
};

/** The entry a focus event comes from, which stays in the page. */
const input = document.body.appendChild(document.createElement("input"));

const createFocusEvent = (relatedTarget: Element | null = null) =>
  ({
    relatedTarget,
    currentTarget: input,
  }) as unknown as FocusEvent<HTMLInputElement>;

describe("useSuggestions", () => {
  it("names the listbox, the footer and the anchor from the base id", () => {
    const { result } = mount();
    expect(result.current.getMenuProps({}, { suppressRefError: true }).id).toBe(
      ":r1:-listbox",
    );
    expect(result.current.footerId).toBe(":r1:-footer");
    expect(result.current.anchorName).toBe("--query-input-r1");
  });

  it("stays closed before scripts run, even with focus", () => {
    const { result } = renderHook(() => useSuggestions(props));
    act(() =>
      result.current.getEntryProps("own", {}).onFocus?.(createFocusEvent()),
    );
    expect(result.current.isOpen).toBe(false);
    expect(result.current.hasFocus).toBe(true);
  });

  it("opens on focus, and only the focused entry is expanded", () => {
    const { result } = mount();
    act(() =>
      result.current.getEntryProps("chip", {}).onFocus?.(createFocusEvent()),
    );
    expect(result.current.isOpen).toBe(true);
    expect(result.current.getEntryProps("chip", {})["aria-expanded"]).toBe(
      true,
    );
    expect(result.current.getEntryProps("own", {})["aria-expanded"]).toBe(
      false,
    );
  });

  it("keeps the entry's own style and description beside its own", () => {
    const { result } = mount({ hasFooter: true });
    act(() =>
      result.current.getEntryProps("own", {}).onFocus?.(createFocusEvent()),
    );
    const entry = result.current.getEntryProps("own", {
      style: { color: "red" },
      "aria-describedby": "hint",
    });
    expect(entry.style).toEqual({
      color: "red",
      anchorName: "--query-input-r1",
    });
    expect(entry["aria-describedby"]).toBe("hint :r1:-footer");
    expect(result.current.getEntryProps("own", {})["aria-describedby"]).toBe(
      ":r1:-footer",
    );
  });

  it("calls the entry's own focus and blur handlers", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { result } = mount();
    act(() =>
      result.current
        .getEntryProps("own", { onFocus, onBlur })
        .onFocus?.(createFocusEvent()),
    );
    act(() =>
      result.current
        .getEntryProps("own", { onFocus, onBlur })
        .onBlur?.(createFocusEvent()),
    );
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
    expect(result.current.hasFocus).toBe(false);
  });

  it("keeps the list when focus moves to the other entry in the root", () => {
    const root = document.createElement("div");
    const other = document.createElement("input");
    other.setAttribute("role", "combobox");
    const outside = document.createElement("button");
    root.append(other, outside);
    const { result } = mount({ rootRef: { current: root } });
    act(() =>
      result.current.getEntryProps("own", {}).onFocus?.(createFocusEvent()),
    );
    act(() =>
      result.current.getEntryProps("own", {}).onBlur?.(createFocusEvent(other)),
    );
    expect(result.current.hasFocus).toBe(true);
    act(() =>
      result.current
        .getEntryProps("own", {})
        .onBlur?.(createFocusEvent(outside)),
    );
    expect(result.current.hasFocus).toBe(false);
  });

  it("opens with only a loading state or empty text to show", () => {
    const loading = mount({ options: [], loading: true });
    act(() =>
      loading.result.current
        .getEntryProps("own", {})
        .onFocus?.(createFocusEvent()),
    );
    expect(loading.result.current.isOpen).toBe(true);
    const empty = mount({ options: [], hasEmptyText: true });
    act(() =>
      empty.result.current
        .getEntryProps("own", {})
        .onFocus?.(createFocusEvent()),
    );
    expect(empty.result.current.isOpen).toBe(true);
  });
});
