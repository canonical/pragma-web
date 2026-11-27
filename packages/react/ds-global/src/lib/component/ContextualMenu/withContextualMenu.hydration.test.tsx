import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { type ReactNode, useLayoutEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../testing/index.js";
import type { MenuEntry } from "./types.js";
import { assertDefined } from "./utils/index.js";
import withContextualMenu from "./withContextualMenu.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const links: MenuEntry[] = [
  { url: "#docs", label: "Docs" },
  { url: "#blog", label: "Blog" },
];

const PlainMenu = withContextualMenu((props: ComponentProps<"button">) => (
  <button {...props} />
));

/** A menu of `items` and a button outside it. */
const Page = ({ items = links }: { items?: MenuEntry[] }) => (
  <>
    <PlainMenu items={items}>Actions</PlainMenu>
    <button type="button">Elsewhere</button>
  </>
);

/** Server-renders `ui`, opens the menu, focuses `focus` and hydrates. */
const hydrateOpen = async (ui: ReactNode, focus?: () => HTMLElement) => {
  const container = document.createElement("div");
  container.innerHTML = renderToString(ui);
  document.body.append(container);
  // The toggle fires, as the stand-in queues it, before React listens.
  const popover = assertDefined(
    container.querySelector<HTMLElement>("[popover]"),
    "the popover is rendered",
  );
  const toggled = new Promise((resolve) =>
    popover.addEventListener("toggle", resolve, { once: true }),
  );
  fireEvent.click(screen.getByText("Actions"));
  await toggled;
  if (focus) act(() => focus().focus());
  const onRecoverableError = vi.fn();
  const root = await act(async () =>
    hydrateRoot(container, ui, { onRecoverableError }),
  );
  expect(onRecoverableError).not.toHaveBeenCalled();
  return () => {
    act(() => root.unmount());
    container.remove();
  };
};

describe("withContextualMenu hydration", () => {
  it("hydrates with no mismatch, and adds the ARIA after mount", async () => {
    const ui = <Page />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    const trigger = assertDefined(
      container.querySelector("button"),
      "the trigger is rendered",
    );
    expect(trigger).not.toHaveAttribute("aria-haspopup");
    const onRecoverableError = vi.fn();
    const root = await act(async () =>
      hydrateRoot(container, ui, { onRecoverableError }),
    );
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector("button")).toBe(trigger);
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    act(() => root.unmount());
    container.remove();
  });

  it("reads a menu opened before hydration", async () => {
    const cleanup = await hydrateOpen(<Page />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    cleanup();
  });

  it("keeps focus on the item that had it", async () => {
    const cleanup = await hydrateOpen(<Page />, () =>
      assertDefined(screen.getByText("Blog").closest("a"), "Blog is a link"),
    );
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Blog" })).toHaveFocus(),
    );
    cleanup();
  });

  it("keeps focus on the item that had it, though a re-render replaces it", async () => {
    // An item whose key changes as it mounts, so the first re-render after
    // hydration replaces the element that had focus.
    const Shifting = () => {
      const [isLaidOut, setLaidOut] = useState(false);
      useLayoutEffect(() => setLaidOut(true), []);
      return (
        <Page
          items={[
            { url: "#docs", label: "Docs" },
            {
              key: isLaidOut ? "blog-client" : "blog",
              url: "#blog",
              label: "Blog",
            },
          ]}
        />
      );
    };
    const cleanup = await hydrateOpen(<Shifting />, () =>
      assertDefined(screen.getByText("Blog").closest("a"), "Blog is a link"),
    );
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Blog" })).toHaveFocus(),
    );
    cleanup();
  });

  it("leaves focus outside when it was outside", async () => {
    const cleanup = await hydrateOpen(<Page />, () =>
      screen.getByText("Elsewhere"),
    );
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
    expect(screen.getByText("Elsewhere")).toHaveFocus();
    cleanup();
  });

  it("moves focus in from the trigger it was left on", async () => {
    const cleanup = await hydrateOpen(<Page />, () =>
      screen.getByText("Actions"),
    );
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
    fireEvent.keyDown(screen.getByText("Actions"), { key: "ArrowDown" });
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Docs" })).toHaveFocus(),
    );
    cleanup();
  });
});
