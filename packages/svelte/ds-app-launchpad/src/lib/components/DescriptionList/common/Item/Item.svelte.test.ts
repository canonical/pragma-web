/* @canonical/generator-ds 0.17.1 */

import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import type { Locator } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import type { DescriptionListContext } from "../../types.js";
import ItemTestHost from "./ItemTestHost.fixtures.svelte";

vi.mock("../../context.js", () => {
  return {
    getDescriptionListContext: (): DescriptionListContext => ({
      layout: "auto",
    }),
    setDescriptionListContext: (context: DescriptionListContext) => context,
  };
});

describe("Item component", () => {
  const baseProps = {
    "data-testid": "description-list-item",
  } satisfies ComponentProps<typeof ItemTestHost>;

  it("renders", async () => {
    const page = await render(ItemTestHost, { ...baseProps });
    await expect.element(componentLocator(page)).toBeInTheDocument();
    await expect.element(termLocator(page)).toHaveTextContent("Term");
    await expect
      .element(descriptionLocator(page))
      .toHaveTextContent("Description");
  });

  describe("attributes", () => {
    it.each([
      ["id", "test-id"],
      ["aria-label", "test-aria-label"],
    ])("applies %s", async (attribute, expected) => {
      const page = await render(ItemTestHost, {
        ...baseProps,
        [attribute]: expected,
      });
      await expect
        .element(componentLocator(page))
        .toHaveAttribute(attribute, expected);
    });

    it("applies classes", async () => {
      const page = await render(ItemTestHost, {
        ...baseProps,
        class: "test-class",
      });
      await expect.element(componentLocator(page)).toHaveClass("test-class");
    });

    it("applies style", async () => {
      const page = await render(ItemTestHost, {
        ...baseProps,
        style: "color: orange;",
      });
      await expect
        .element(componentLocator(page))
        .toHaveStyle({ color: "orange" });
    });
  });
});

function componentLocator(page: RenderResult<typeof ItemTestHost>): Locator {
  return page.getByTestId("description-list-item");
}

function termLocator(page: RenderResult<typeof ItemTestHost>): Locator {
  return page.getByRole("term");
}

function descriptionLocator(page: RenderResult<typeof ItemTestHost>): Locator {
  return page.getByRole("definition");
}
