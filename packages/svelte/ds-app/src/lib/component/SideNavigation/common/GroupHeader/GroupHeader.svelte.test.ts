// Ported from @canonical/react-ds-app SideNavigation GroupHeader

import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import { fixtureText, richLabel } from "../../test.fixtures.svelte";
import GroupHeader from "./GroupHeader.svelte";
import css from "./styles.css?raw";

describe("GroupHeader", () => {
  it("renders its children", async () => {
    const page = await render(GroupHeader, { children: "Hardware" });
    await expect.element(page.getByText("Hardware")).toBeInTheDocument();
  });

  it("applies the base and custom class", async () => {
    const page = await render(GroupHeader, {
      class: "custom-class",
      children: "Hardware",
    });
    const element = page.getByText("Hardware");
    await expect.element(element).toHaveClass("ds");
    await expect.element(element).toHaveClass("side-navigation-group-header");
    await expect.element(element).toHaveClass("custom-class");
  });

  it("passes through native props", async () => {
    const page = await render(GroupHeader, {
      "data-testid": "header",
      children: "Hardware",
    });
    await expect.element(page.getByTestId("header")).toBeInTheDocument();
  });

  it("sets title as a native tooltip fallback for truncation when children is text", async () => {
    const page = await render(GroupHeader, { children: "Hardware" });
    await expect
      .element(page.getByText("Hardware"))
      .toHaveAttribute("title", "Hardware");
  });

  it("lets a consumer-supplied title override the default", async () => {
    const page = await render(GroupHeader, {
      title: "Custom tooltip",
      children: "Hardware",
    });
    await expect
      .element(page.getByText("Hardware"))
      .toHaveAttribute("title", "Custom tooltip");
  });

  it("renders snippet content without a title", async () => {
    const page = await render(GroupHeader, { children: richLabel });
    const strong = page.getByText(fixtureText.richLabel).element();
    expect(strong.tagName).toBe("STRONG");
    expect(strong.parentElement?.hasAttribute("title")).toBe(false);
  });

  it("renders in uppercase, matching the Figma spec's literal text case (the DOM text stays mixed-case)", async () => {
    const page = await render(GroupHeader, { children: "Hardware" });
    expect(css).toContain("text-transform: uppercase");
    expect(page.container.textContent).toBe("Hardware");
  });
});
