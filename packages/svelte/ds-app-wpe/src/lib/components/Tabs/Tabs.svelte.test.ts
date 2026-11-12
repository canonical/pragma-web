import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Tabs from "./Tabs.svelte";
import type { TabsProps } from "./types.js";

const props = {
  "aria-label": "Directory sections",
  navigationRoot: {
    key: "directory",
    items: [
      { url: "#people", label: "People" },
      { url: "#teams", label: "Teams" },
      { key: "soon", label: "Coming soon" },
      { url: "#archived", label: "Archived", disabled: true },
    ],
  },
  currentUrl: "#people",
} satisfies TabsProps;

describe("Tabs component", () => {
  it("renders native links in named navigation", async () => {
    const page = await render(Tabs, props);
    await expect
      .element(page.getByRole("navigation", { name: "Directory sections" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("link", { name: "People" }))
      .toHaveAttribute("href", "#people");
  });

  it("follows currentUrl updates without local selection", async () => {
    const page = await render(Tabs, props);
    await page.rerender({ currentUrl: "#teams" });
    await expect
      .element(page.getByRole("link", { name: "Teams" }))
      .toHaveAttribute("aria-current", "page");
    await expect
      .element(page.getByRole("link", { name: "People" }))
      .not.toHaveAttribute("aria-current");
  });

  it("does not change the active section merely by clicking", async () => {
    const page = await render(Tabs, props);
    await page.getByRole("link", { name: "Teams" }).click();
    await expect
      .element(page.getByRole("link", { name: "People" }))
      .toHaveAttribute("aria-current", "page");
    await expect
      .element(page.getByRole("link", { name: "Teams" }))
      .not.toHaveAttribute("aria-current");
  });

  it("keeps links in the native Tab order and does not intercept arrows", async () => {
    const page = await render(Tabs, props);
    const people = page.getByRole("link", { name: "People" });
    const teams = page.getByRole("link", { name: "Teams" });
    people.element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(people).toHaveFocus();
    await userEvent.keyboard("{Tab}");
    await expect.element(teams).toHaveFocus();
  });

  it("renders unavailable sections without links or tab stops", async () => {
    const page = await render(Tabs, props);
    const disabled = page.getByText("Archived");
    await expect.element(disabled).toHaveAttribute("aria-disabled", "true");
    expect(disabled.element().tagName).toBe("SPAN");
    expect(page.getByText("Coming soon").element().tagName).toBe("SPAN");
  });
});
