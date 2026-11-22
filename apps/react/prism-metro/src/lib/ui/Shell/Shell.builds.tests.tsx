import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { Environment } from "relay-runtime";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRoutes, notFoundRoute } from "../../../routes.js";
import Shell from "./Shell.js";

/** The route table of the metro built with `PRISM_SEARCH=off`. */
const noSearchRoutes = Object.fromEntries(
  Object.entries(appRoutes).filter(([name]) => name !== "search"),
) as Omit<typeof appRoutes, "search">;

/** React's generated ids, which count the roots mounted before. */
const GENERATED_ID = /«r[0-9a-z]+»|:r[0-9a-z]+:/g;

/**
 * Render the Shell over `routes` at the not-found page, open the palette
 * with Ctrl K, type "but", answer each request with a generated payload,
 * and return a copy of the rendered DOM.
 */
const renderBuild = async (
  routes: typeof appRoutes | typeof noSearchRoutes,
): Promise<HTMLElement> => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn`.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  const router = createRouter(routes, {
    adapter: createMemoryAdapter("/not-found"),
    notFound: notFoundRoute,
  });
  const view = render(
    <Shell
      environment={environment as unknown as Environment}
      router={router}
    />,
  );
  await screen.findAllByRole("link", { name: "Lines" });
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  const palette = view.container.querySelector("dialog");
  if (palette === null) throw new Error("the Shell renders no palette");
  fireEvent.change(await within(palette).findByRole("combobox"), {
    target: { value: "but" },
  });
  for (const operation of environment.mock.getAllOperations()) {
    await act(async () => {
      environment.mock.resolve(
        operation,
        MockPayloadGenerator.generate(operation),
      );
    });
  }
  const copy = view.container.cloneNode(true) as HTMLElement;
  view.unmount();
  return copy;
};

/** The rail's Search entry, the palette's hand-off line and the palette. */
const findRegions = (dom: HTMLElement) => ({
  railEntry:
    [...dom.querySelectorAll("a")]
      .find((link) => link.textContent === "Search")
      ?.closest("li") ?? null,
  handoff: dom.querySelector(".handoff"),
  palette: dom.querySelector("dialog"),
});

// jsdom's dialog has no modal state: opening it marks it open.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.open = true;
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
});

describe("the metro's two builds", () => {
  it("differ in the rail's Search entry, the hand-off line and the palette's contents only (W8-A3)", async () => {
    const withSearch = await renderBuild(appRoutes);
    const withoutSearch = await renderBuild(noSearchRoutes);
    const on = findRegions(withSearch);
    const off = findRegions(withoutSearch);
    expect(on.railEntry).not.toBeNull();
    expect(off.railEntry).toBeNull();
    expect(on.handoff?.textContent).toBe("Search everything for “but”");
    expect(off.handoff).toBeNull();
    expect(on.palette?.getAttribute("aria-label")).toBe("Search the graph");
    expect(off.palette?.getAttribute("aria-label")).toBe("Jump to");
    for (const region of [on.railEntry, on.handoff, on.palette, off.palette]) {
      region?.remove();
    }
    expect(withSearch.innerHTML.replace(GENERATED_ID, "id")).toBe(
      withoutSearch.innerHTML.replace(GENERATED_ID, "id"),
    );
  });
});
