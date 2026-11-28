import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Component from "./Card.svelte";
import { composition } from "./test.fixtures.svelte";

describe("Card SSR", () => {
  it("doesn't throw", () => {
    expect(() => {
      render(Component, { props: {} });
    }).not.toThrow();
  });

  it("renders", () => {
    const page = render(Component, { props: {} });
    expect(page.container.innerHTML).toContain("<div");
    expect(page.container.innerHTML).toContain("</div>");
  });

  it("applies className", () => {
    const page = render(Component, { props: { class: "test-class" } });
    expect(page.container.innerHTML).toContain('class="ds card test-class"');
  });

  it("renders the sections with their classes, in track order", () => {
    const page = render(Component, { props: { children: composition } });
    const card = page.container.querySelector(".ds.card");
    expect(
      Array.from(card?.children ?? [], (child) => child.className),
    ).toEqual([
      "ds card-image",
      "ds card-header",
      "ds card-content",
      "ds card-footer",
    ]);
  });
});
