import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Component from "./Card.svelte";
import {
  bodyText,
  cardText,
  composition,
  tagText,
  text,
  titleText,
} from "./test.fixtures.svelte";

describe("Card component", () => {
  it("renders", async () => {
    const page = await render(Component, { children: text });
    await expect.element(page.getByText(cardText)).toBeInTheDocument();
  });

  it("applies classes and native attributes", async () => {
    const page = await render(Component, {
      children: text,
      class: "test-class",
      "data-testid": "card",
      "aria-label": "Card label",
    });
    const card = page.getByTestId("card");
    await expect.element(card).toHaveClass("ds", "card", "test-class");
    await expect.element(card).toHaveAttribute("aria-label", "Card label");
  });

  it("renders a full composition with the header adjacent to the content", async () => {
    const page = await render(Component, { children: composition });

    const header = page.getByText(titleText);
    await expect.element(header).toHaveClass("card-header");
    // The header is not a separate visual section: it merges with the content
    // that follows (the seam-collapse selector targets this adjacency).
    expect(header.element().nextElementSibling).toHaveClass("card-content");
    await expect.element(page.getByText(bodyText)).toHaveClass("card-content");
    // Footer carries tags and labels, not CTAs or links.
    await expect.element(page.getByText(tagText)).toBeInTheDocument();
    expect(page.container.querySelector(".card-footer a")).toBeNull();
  });

  it("places each section on its own row track", async () => {
    const page = await render(Component, { children: composition });
    const rows = [
      ".card-image",
      ".card-header",
      ".card-content",
      ".card-footer",
    ]
      .map((selector) => page.container.querySelector(selector))
      .map((element) => element && getComputedStyle(element).gridRowStart);
    expect(rows).toEqual(["1", "2", "3", "4"]);
  });

  it("collapses the header's block-end padding before the content", async () => {
    const page = await render(Component, { children: composition });
    const header = page.getByText(titleText).element();
    expect(getComputedStyle(header).paddingBlockEnd).toBe("0px");
  });
});
