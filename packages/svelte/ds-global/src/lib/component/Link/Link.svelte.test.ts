import type { Locator } from "@vitest/browser/context";
import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import Component from "./Link.svelte";
import { children, childrenProps } from "./test.fixtures.svelte";

describe("Link component", () => {
  const baseProps = {
    children,
    href: "https://ubuntu.com",
    "data-testid": "link",
  } satisfies ComponentProps<typeof Component>;

  it("renders", async () => {
    const page = await render(Component, { ...baseProps });
    await expect.element(componentLocator(page)).toBeInTheDocument();
    await expect.element(page.getByText(childrenProps.label)).toBeVisible();
  });

  describe("attributes", () => {
    it.each([
      ["id", "test-id"],
      ["aria-label", "test-aria-label"],
    ])("applies %s", async (attribute, expected) => {
      const page = await render(Component, {
        ...baseProps,
        [attribute]: expected,
      });
      await expect
        .element(componentLocator(page))
        .toHaveAttribute(attribute, expected);
    });

    it("applies classes", async () => {
      const page = await render(Component, {
        ...baseProps,
        class: "test-class",
      });
      await expect.element(componentLocator(page)).toHaveClass("test-class");
      await expect.element(componentLocator(page)).toHaveClass("ds");
      await expect.element(componentLocator(page)).toHaveClass("link");
    });

    it("inherits parent color when appearance is soft", async () => {
      const parentColor = "rgb(255, 0, 0)";

      document.body.style.color = parentColor;

      const page = await render(Component, {
        ...baseProps,
        appearance: "soft",
      });
      await expect.element(componentLocator(page)).toHaveStyle({
        color: parentColor,
      });
    });

    it("applies style", async () => {
      const page = await render(Component, {
        ...baseProps,
        style: "color: orange;",
      });
      await expect
        .element(componentLocator(page))
        .toHaveStyle({ color: "orange" });
    });
  });
});

function componentLocator(page: RenderResult<typeof Component>): Locator {
  return page.getByTestId("link");
}
