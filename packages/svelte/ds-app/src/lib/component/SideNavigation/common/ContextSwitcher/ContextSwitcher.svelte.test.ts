// Ported from @canonical/react-ds-app SideNavigation ContextSwitcher

import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import { badge, fixtureText, richLabel } from "../../test.fixtures.svelte";
import ContextSwitcher from "./ContextSwitcher.svelte";
import type { ContextSwitcherItem } from "./types.js";

const contexts: ContextSwitcherItem[] = [
  { key: "acme", name: "Acme Corp", description: "Main account" },
  { key: "globex", name: "Globex", description: "Secondary account" },
];

type Page = RenderResult<typeof ContextSwitcher>;

const menu = (page: Page) =>
  page.container.querySelector('[role="menu"]') as HTMLElement;
const rowOf = (page: Page, text: string) =>
  page
    .getByText(text, { exact: true })
    .element()
    .closest('[role="menuitem"]') as HTMLElement;

/** Opens the menu. */
const open = async (page: Page) => {
  await page.getByRole("button", { name: /Acme Corp/ }).click();
  await expect.element(menu(page)).toHaveAttribute("aria-hidden", "false");
};

describe("ContextSwitcher", () => {
  it("shows the current context's name in the trigger, with menu-button semantics", async () => {
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
    });
    const trigger = page.getByRole("button", { name: /Acme Corp/ });
    await expect.element(trigger).toHaveAttribute("aria-haspopup", "menu");
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("lists every context, including description, once open", async () => {
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
    });
    await open(page);
    await expect.element(page.getByRole("menu")).toBeVisible();
    await expect.element(page.getByText("Globex")).toBeVisible();
    await expect.element(page.getByText("Secondary account")).toBeVisible();
  });

  it("always renders the description (required by the anatomy)", async () => {
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
    });
    expect(
      page.container.querySelectorAll(".content > .description"),
    ).toHaveLength(2);
  });

  it("renders each context as a menuitem", async () => {
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
    });
    await open(page);
    expect(page.container.querySelectorAll('[role="menuitem"]')).toHaveLength(
      2,
    );
  });

  it("calls oncontextchange and closes when a context is selected", async () => {
    const oncontextchange = vi.fn();
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
      oncontextchange,
    });
    await open(page);
    rowOf(page, "Globex").click();
    expect(oncontextchange).toHaveBeenCalledWith(contexts[1]);
    await expect.element(menu(page)).toHaveAttribute("aria-hidden", "true");
  });

  it("marks the current context item for styling", async () => {
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
    });
    const [acme, globex] = Array.from(
      page.container.querySelectorAll(".content"),
    );
    expect(acme.querySelector(".name")?.textContent).toBe("Acme Corp");
    expect(acme.classList.contains("current")).toBe(true);
    expect(globex.classList.contains("current")).toBe(false);
  });

  it("renders a create-context action and calls oncreatecontext", async () => {
    const oncreatecontext = vi.fn();
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
      oncreatecontext,
    });
    await open(page);
    expect(page.container.querySelector("hr.separator")).not.toBeNull();
    rowOf(page, "Create context").click();
    expect(oncreatecontext).toHaveBeenCalledOnce();
  });

  it("renders the create-context label as a rich node, not just a plain string", async () => {
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
      oncreatecontext: vi.fn(),
      createContextLabel: richLabel,
    });
    await open(page);
    const label = page.getByText(fixtureText.richLabel).element();
    expect(label.tagName).toBe("STRONG");
  });

  it("omits the create-context action when oncreatecontext is not given", async () => {
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
    });
    await open(page);
    await expect
      .element(page.getByText("Create context"))
      .not.toBeInTheDocument();
    expect(page.container.querySelector("hr.separator")).toBeNull();
  });

  it("renders a badge when a context has one", async () => {
    const withBadge: ContextSwitcherItem[] = [
      ...contexts,
      { key: "beta", name: "Beta", description: "Beta", badge },
    ];
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts: withBadge,
    });
    await open(page);
    await expect.element(page.getByText(fixtureText.badge)).toBeVisible();
  });

  it("renders no caption by default", async () => {
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
    });
    expect(
      page.container.querySelector(".ds.side-navigation-group-header"),
    ).toBeNull();
  });

  it("renders the title as a GroupHeader caption above the trigger", async () => {
    const page = await render(ContextSwitcher, {
      title: "Context",
      currentContext: contexts[0],
      contexts,
    });
    const caption = page.getByText("Context", { exact: true }).element();
    expect(caption.classList.contains("side-navigation-group-header")).toBe(
      true,
    );
    expect(
      caption.parentElement?.classList.contains(
        "side-navigation-context-switcher",
      ),
    ).toBe(true);
    expect(
      caption.nextElementSibling?.classList.contains("contextual-menu"),
    ).toBe(true);
  });

  it("navigates contexts with arrow keys and selects with Enter", async () => {
    const oncontextchange = vi.fn();
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
      oncontextchange,
    });
    await open(page);
    const roving = () =>
      page.container.querySelector(
        '[role="menuitem"][tabindex="0"]',
      ) as HTMLElement;
    await expect.poll(() => document.activeElement).toBe(roving());
    roving().dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    await tick();
    roving().dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(oncontextchange).toHaveBeenCalledWith(contexts[1]);
  });

  it("reports open changes and supports a bound open state", async () => {
    const onopenchange = vi.fn();
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
      onopenchange,
      open: true,
    });
    await expect.element(menu(page)).toHaveAttribute("aria-hidden", "false");
    await page.getByRole("button", { name: /Acme Corp/ }).click();
    expect(onopenchange).toHaveBeenCalledWith(false);
    await expect.element(menu(page)).toHaveAttribute("aria-hidden", "true");
  });

  it("caps the list at the rail's inner width by default, or the given maxWidth", async () => {
    const page = await render(ContextSwitcher, {
      currentContext: contexts[0],
      contexts,
    });
    expect(menu(page).style.maxWidth).toBe(
      "calc(var(--sidenav-rail-inline-size) - 2 * var(--sidenav-inset-inline))",
    );
    await page.rerender({ maxWidth: "10rem" });
    await expect.poll(() => menu(page).style.maxWidth).toBe("10rem");
  });

  // React-only: viewport fitment (preferredDirections, distance, gutter,
  // autoFit) belongs to ContextualMenu, which Svelte does not have yet.
});
