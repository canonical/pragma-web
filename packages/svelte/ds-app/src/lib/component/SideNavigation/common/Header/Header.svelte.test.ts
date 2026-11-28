// Ported from @canonical/react-ds-app SideNavigation Header

import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { brand, fixtureText, richLabel } from "../../test.fixtures.svelte";
import Header from "./Header.svelte";

describe("Header", () => {
  it("renders brand content", async () => {
    const page = await render(Header, { brand });
    await expect.element(page.getByText(fixtureText.brand)).toBeInTheDocument();
  });

  it("applies the base and custom class to the root", async () => {
    const page = await render(Header, { class: "custom-class", brand });
    const root = page.container.firstElementChild as HTMLElement;
    await expect.element(root).toHaveClass("ds");
    await expect.element(root).toHaveClass("side-navigation-header");
    await expect.element(root).toHaveClass("custom-class");
  });

  it("passes through additional props", async () => {
    const page = await render(Header, {
      "data-testid": "test-component",
      brand,
    });
    await expect
      .element(page.getByTestId("test-component"))
      .toBeInTheDocument();
  });

  it("does not render the collapse toggle without an ontoggle handler", async () => {
    const page = await render(Header, { brand });
    await expect.element(page.getByRole("button")).not.toBeInTheDocument();
  });

  it("renders the collapse toggle when ontoggle is provided", async () => {
    const ontoggle = vi.fn();
    const page = await render(Header, {
      expanded: true,
      ontoggle,
      collapseControls: "nav-content",
      brand,
    });
    const toggle = page.getByRole("button");
    await expect
      .element(toggle)
      .toHaveAttribute("aria-controls", "nav-content");
    await expect.element(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.click();
    expect(ontoggle).toHaveBeenCalledOnce();
  });

  it("renders the application name as a heading, from text or a snippet", async () => {
    const page = await render(Header, { applicationName: "MAAS" });
    await expect
      .element(page.getByRole("heading", { name: "MAAS" }))
      .toBeInTheDocument();

    await page.rerender({ applicationName: richLabel });
    await expect
      .element(page.getByRole("heading", { name: fixtureText.richLabel }))
      .toBeInTheDocument();
  });

  it("omits the title without an application name", async () => {
    const page = await render(Header, { brand });
    expect(page.container.querySelector(".title")).toBeNull();
  });
});
