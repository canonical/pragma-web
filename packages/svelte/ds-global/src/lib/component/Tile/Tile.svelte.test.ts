import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Component from "./Tile.svelte";
import {
  contentOnly,
  contentText,
  headerText,
  sections,
  testIdSections,
} from "./test.fixtures.svelte";

describe("Tile", () => {
  it("renders children", async () => {
    const page = await render(Component, { children: sections });
    await expect.element(page.getByText(headerText)).toBeInTheDocument();
    await expect.element(page.getByText(contentText)).toBeInTheDocument();
  });

  it("applies ds tile class", async () => {
    const page = await render(Component, {
      children: sections,
      "data-testid": "tile",
    });
    await expect
      .element(page.getByTestId("tile"))
      .toHaveClass("ds", "tile", "surface");
  });

  it("applies custom className", async () => {
    const page = await render(Component, {
      children: sections,
      class: "custom",
      "data-testid": "tile",
    });
    await expect
      .element(page.getByTestId("tile"))
      .toHaveClass("ds", "tile", "custom");
  });

  it("passes through HTML attributes", async () => {
    const page = await render(Component, {
      children: sections,
      "data-testid": "my-tile",
      "aria-label": "My tile",
    });
    await expect
      .element(page.getByTestId("my-tile"))
      .toHaveAttribute("aria-label", "My tile");
  });

  it("renders Header with correct class", async () => {
    const page = await render(Component, { children: testIdSections });
    await expect
      .element(page.getByTestId("header"))
      .toHaveClass("ds", "tile-header");
  });

  it("renders Content with correct class", async () => {
    const page = await render(Component, { children: testIdSections });
    await expect
      .element(page.getByTestId("content"))
      .toHaveClass("ds", "tile-content");
  });

  it("maintains DOM order: Header before Content", async () => {
    const page = await render(Component, {
      children: sections,
      "data-testid": "tile",
    });
    const children = page.getByTestId("tile").element().children;
    expect(children[0]).toHaveClass("tile-header");
    expect(children[1]).toHaveClass("tile-content");
  });

  it("accepts conditional children", async () => {
    const page = await render(Component, {
      children: contentOnly,
      "data-testid": "tile",
    });
    const children = page.getByTestId("tile").element().children;
    expect(children).toHaveLength(1);
    expect(children[0]).toHaveClass("tile-content");
  });
});
