/**
 * The edit session's effects: Back or Forward ends it, and focus moves to
 * the Segment after an edit and to the Entry as it moves, only from inside
 * the bar.
 */
import { createMemoryLocation } from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import renderInRoot from "../../../../../../../testing/renderInRoot.js";
import type { QueryBarDraft } from "../types.js";
import useQueryBarSession from "./useQueryBarSession.js";

const draft: QueryBarDraft = {
  kind: "predicate",
  origin: null,
  field: "status",
  operator: null,
  operands: [],
};

/** A bar's root in the document, holding a chip's parts and an Entry. */
const createRoot = (): HTMLDivElement => {
  const root = document.createElement("div");
  root.innerHTML = `
    <span id="status__isAny__0"><button data-part="value">ready</button></span>
    <input data-roving-item="draft:entry" value="64" />
    <button id="outside-in-root">x</button>`;
  document.body.append(root);
  return root;
};

/** The session in a root over a provider with a memory location. */
const mount = () => {
  const root = createRoot();
  const location = createMemoryLocation({ href: "/machines" });
  const rooted = renderInRoot(
    "QueryBar",
    (provider) => useQueryBarSession({ provider, rootRef: { current: root } }),
    { location },
  );
  return { ...rooted, root, location };
};

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("useQueryBarSession", () => {
  it("starts at rest, the stop on the entry", () => {
    const { hook } = mount();
    expect(hook.result.current.session).toEqual({
      text: "",
      draft: null,
      part: null,
      typed: "",
      invalid: null,
      activeItem: "entry",
      focus: null,
    });
  });

  it("ends the session when the location moves the query, and not for its own writes", () => {
    const { hook, location, provider } = mount();
    act(() => {
      hook.result.current.dispatch({
        type: "edit",
        draft,
        part: "operator",
        typed: "",
      });
    });
    act(() => {
      provider.setSearch("alpha");
    });
    expect(hook.result.current.session.draft).toEqual(draft);
    act(() => {
      location.write(new URLSearchParams("q=beta"));
    });
    expect(hook.result.current.session).toMatchObject({
      draft: null,
      activeItem: "entry",
    });
    // Nothing open, nothing to end.
    act(() => {
      location.write(new URLSearchParams("q=gamma"));
    });
    expect(hook.result.current.session.activeItem).toBe("entry");
  });

  it("ends the session on a reset, and when the clause being edited leaves the query", () => {
    const { hook, provider } = mount();
    const edited: QueryBarDraft = {
      kind: "predicate",
      origin: {
        id: "status__isAny__0",
        ref: { field: "status", operator: "isAny", nth: 0 },
        held: { field: "status", operator: "isAny", operands: ["running"] },
      },
      field: "status",
      operator: "isAny",
      operands: ["running"],
    };
    act(() => {
      readProviderHost(provider).setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["running"],
      });
      hook.result.current.dispatch({
        type: "edit",
        draft: edited,
        part: "value",
        typed: "",
      });
    });
    // A write that keeps the clause keeps the edit.
    act(() => {
      provider.setSearch("alpha");
    });
    expect(hook.result.current.session.draft).toEqual(edited);
    // A sibling at the same address taking its place ends the edit too.
    act(() => {
      readProviderHost(provider).addPredicate({
        field: "status",
        operator: "isAny",
        operands: ["failed"],
      });
    });
    expect(hook.result.current.session.draft).toBeNull();
    act(() => {
      readProviderHost(provider).removePredicate("status", "isAny", 0);
      hook.result.current.dispatch({
        type: "edit",
        draft: edited,
        part: "value",
        typed: "",
      });
    });
    act(() => {
      provider.clear(["filter"]);
    });
    expect(hook.result.current.session.draft).toBeNull();
    act(() => {
      hook.result.current.dispatch({
        type: "edit",
        draft,
        part: "operator",
        typed: "",
      });
    });
    act(() => {
      provider.reset();
    });
    expect(hook.result.current.session.draft).toBeNull();
  });

  it("focuses the Entry as it opens, typed on from its end", () => {
    const { hook, root } = mount();
    const entry = root.querySelector("input") as HTMLInputElement;
    act(() => {
      hook.result.current.dispatch({
        type: "edit",
        draft,
        part: "value",
        typed: "",
      });
    });
    expect(document.activeElement).toBe(entry);
    expect(entry.selectionStart).toBe(2);
  });

  it("leaves focus that went elsewhere, or is on the Entry already", () => {
    const { hook, root } = mount();
    const elsewhere = document.createElement("button");
    document.body.append(elsewhere);
    elsewhere.focus();
    act(() => {
      hook.result.current.dispatch({
        type: "edit",
        draft,
        part: "value",
        typed: "",
      });
    });
    expect(document.activeElement).toBe(elsewhere);
    const entry = root.querySelector("input") as HTMLInputElement;
    entry.focus();
    entry.setSelectionRange(0, 0);
    act(() => {
      hook.result.current.dispatch({
        type: "edit",
        draft,
        part: "operator",
        typed: "",
      });
    });
    expect(entry.selectionStart).toBe(0);
  });

  it("focuses the edited Segment a task after the Entry closes", () => {
    vi.useFakeTimers();
    const { hook, root } = mount();
    (root.querySelector("#outside-in-root") as HTMLElement).focus();
    act(() => {
      hook.result.current.dispatch({
        type: "close",
        item: "status__isAny__0",
        focus: "value",
      });
    });
    expect(document.activeElement).toBe(root.querySelector("#outside-in-root"));
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(document.activeElement).toBe(root.querySelector("[data-part]"));
    expect(hook.result.current.session.focus).toBeNull();
  });

  it("leaves focus outside the bar where it went, and forgets the Segment", () => {
    vi.useFakeTimers();
    const { hook } = mount();
    const elsewhere = document.createElement("button");
    document.body.append(elsewhere);
    elsewhere.focus();
    act(() => {
      hook.result.current.dispatch({
        type: "close",
        item: "status__isAny__0",
        focus: "value",
      });
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(document.activeElement).toBe(elsewhere);
    expect(hook.result.current.session.focus).toBeNull();
  });
});
