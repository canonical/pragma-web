import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Component from "./Image.svelte";

const imgSrc =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23DDDDDD%22%2F%3E%3C%2Fsvg%3E";

describe("Image component", () => {
  it("renders", async () => {
    const page = await render(Component, { src: imgSrc, alt: "Placeholder" });
    const img = page.getByRole("img");
    await expect.element(img).toBeInTheDocument();
    await expect.element(img).toHaveAttribute("src", imgSrc);
    await expect.element(img).toHaveAttribute("alt", "Placeholder");
  });
});
