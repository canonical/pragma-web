import type { Locator } from "@vitest/browser/context";
import type { ComponentProps } from "svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import type { RenderResult } from "vitest-browser-svelte";
import { render } from "vitest-browser-svelte";
import "../Button/styles.css";
import Component from "./Card.svelte";
import Content from "./common/Content/Content.svelte";
import Footer from "./common/Footer/Footer.svelte";
import Header from "./common/Header/Header.svelte";
import Image from "./common/Image/Image.svelte";

describe("Card component", () => {
  const baseProps = {
    "data-testid": "card",
  } satisfies ComponentProps<typeof Component>;

  it("renders", async () => {
    const page = await render(Component, { ...baseProps });
    await expect.element(componentLocator(page)).toBeInTheDocument();
  });

  it("applies ds card classes", async () => {
    const page = await render(Component, { ...baseProps });
    await expect.element(componentLocator(page)).toHaveClass("ds", "card");
  });

  it("renders children", async () => {
    const page = await render(Component, {
      ...baseProps,
      children: createRawSnippet(() => ({
        render: () => `<span>Content</span>`,
      })),
    });
    await expect.element(page.getByText("Content")).toBeInTheDocument();
  });

  describe("attributes", () => {
    it.each([
      ["id", "test-id"],
      ["aria-label", "test-label"],
    ])("applies %s", async (attribute, expected) => {
      const page = await render(Component, {
        ...baseProps,
        [attribute]: expected,
      });
      await expect
        .element(componentLocator(page))
        .toHaveAttribute(attribute, expected);
    });

    it("applies custom class", async () => {
      const page = await render(Component, { ...baseProps, class: "custom" });
      await expect
        .element(componentLocator(page))
        .toHaveClass("ds", "card", "custom");
    });
  });
});

describe("Card.Header", () => {
  it("renders with card-header class", async () => {
    const page = await render(Header, {
      "data-testid": "header",
      children: createRawSnippet(() => ({
        render: () => `<span>Title</span>`,
      })),
    });
    await expect
      .element(page.getByTestId("header"))
      .toHaveClass("ds", "card-header");
  });
});

describe("Card.Content", () => {
  it("renders with card-content class", async () => {
    const page = await render(Content, {
      "data-testid": "content",
      children: createRawSnippet(() => ({ render: () => `<span>Body</span>` })),
    });
    await expect
      .element(page.getByTestId("content"))
      .toHaveClass("ds", "card-content");
  });

  it("keeps a Button at its intrinsic width", async () => {
    const page = await render(Content, {
      "data-testid": "content",
      style: "width: 400px;",
      children: createRawSnippet(() => ({
        render: () => `<button class="ds button primary">Button</button>`,
      })),
    });
    const content = page.getByTestId("content").element() as HTMLElement;
    const style = getComputedStyle(content);
    const contentBoxWidth =
      content.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    const button = page.getByRole("button").element();
    expect(button.getBoundingClientRect().width).toBeLessThan(contentBoxWidth);
  });

  it("keeps block content full width", async () => {
    const page = await render(Content, {
      "data-testid": "content",
      style: "width: 400px;",
      children: createRawSnippet(() => ({
        render: () => `<div data-testid="block"></div>`,
      })),
    });
    const content = page.getByTestId("content").element() as HTMLElement;
    const style = getComputedStyle(content);
    const contentBoxWidth =
      content.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    const block = page.getByTestId("block").element();
    expect(block.getBoundingClientRect().width).toBeCloseTo(contentBoxWidth);
  });
});

describe("Card.Footer", () => {
  it("renders with card-footer class", async () => {
    const page = await render(Footer, {
      "data-testid": "footer",
      children: createRawSnippet(() => ({ render: () => `<span>Tag</span>` })),
    });
    await expect
      .element(page.getByTestId("footer"))
      .toHaveClass("ds", "card-footer");
  });
});

describe("Card.Image", () => {
  it("renders an img with card-image class", async () => {
    const page = await render(Image, {
      "data-testid": "image",
      src: "test.png",
      alt: "test",
    });
    const img = page.getByTestId("image");
    await expect.element(img).toHaveClass("ds", "card-image");
    expect(img.element().tagName).toBe("IMG");
  });
});

function componentLocator(page: RenderResult<typeof Component>): Locator {
  return page.getByTestId("card");
}
