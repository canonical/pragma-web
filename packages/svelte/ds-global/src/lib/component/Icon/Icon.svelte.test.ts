import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Component from "./Icon.svelte";

describe("Icon component", () => {
  it("renders decoratively by default", async () => {
    const { container } = await render(Component, { icon: "user" });
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).not.toHaveAttribute("aria-label");
  });

  it("exposes a named image when aria-label is provided", async () => {
    await render(Component, { icon: "user", "aria-label": "User profile" });
    const svg = page.getByRole("img", { name: "User profile" });
    await expect.element(svg).not.toHaveAttribute("aria-hidden");
  });

  it("exposes a named image when aria-labelledby is provided", async () => {
    const { container } = await render(Component, {
      icon: "user",
      "aria-labelledby": "label-id",
    });
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).not.toHaveAttribute("aria-hidden");
  });

  it("treats an empty aria-label as decorative", async () => {
    const { container } = await render(Component, {
      icon: "user",
      "aria-label": "",
    });
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("honours an explicit role", async () => {
    await render(Component, { icon: "user", role: "presentation" });
    const svg = page.getByRole("presentation");
    await expect.element(svg).not.toHaveAttribute("aria-hidden");
  });

  it("applies class", async () => {
    const { container } = await render(Component, {
      icon: "user",
      class: "test-class",
    });
    expect(container.querySelector("svg")).toHaveClass("test-class");
  });

  it("resolves the icon from a custom rootPath", async () => {
    const { container } = await render(Component, {
      icon: "user",
      rootPath: "/assets/icons",
    });
    expect(container.querySelector("use")).toHaveAttribute(
      "href",
      "/assets/icons/user.svg#user",
    );
  });
});
