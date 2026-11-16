import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../testing/index.js";
import withDropdownMenu from "./withDropdownMenu.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const Trigger = withDropdownMenu(Button);
const OptionsTrigger = ({ children }: { children: string }) => (
  <Trigger items={[{ url: "/docs", label: "Docs" }]}>{children}</Trigger>
);

/** Server-renders the trigger into the page. */
const serve = () => {
  const ui = <OptionsTrigger>Open</OptionsTrigger>;
  const container = document.createElement("div");
  container.innerHTML = renderToString(ui);
  document.body.append(container);
  const trigger = assertInvariant(
    container.querySelector("button"),
    "the element renders",
  );
  return { ui, container, trigger };
};

describe("withDropdownMenu hydration", () => {
  it("hydrates with no mismatch, and adds the ARIA after mount", async () => {
    const { ui, container, trigger } = serve();
    expect(trigger).not.toHaveAttribute("aria-expanded");
    const onRecoverableError = vi.fn();
    const root = await act(async () =>
      hydrateRoot(container, ui, { onRecoverableError }),
    );
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector("button")).toBe(trigger);
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    act(() => root.unmount());
    container.remove();
  });

  it("keeps a menu opened before hydration in sync", async () => {
    const { ui, container, trigger } = serve();
    trigger.click();
    await Promise.resolve();
    const root = await act(async () => hydrateRoot(container, ui));
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    act(() => root.unmount());
    container.remove();
  });
});
