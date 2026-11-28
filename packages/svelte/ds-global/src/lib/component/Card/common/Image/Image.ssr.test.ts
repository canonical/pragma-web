import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Component from "./Image.svelte";

describe("Image SSR", () => {
  it("doesn't throw", () => {
    expect(() => {
      render(Component, { props: {} });
    }).not.toThrow();
  });

  it("renders", () => {
    const page = render(Component, { props: {} });
    const img = page.container.querySelector("img");
    expect(img?.getAttribute("class")).toBe("ds card-image");
    expect(img?.hasAttribute("alt")).toBe(false);
  });

  it("applies className", () => {
    const page = render(Component, { props: { class: "test-class" } });
    expect(page.container.querySelector("img")?.getAttribute("class")).toBe(
      "ds card-image test-class",
    );
  });
});
