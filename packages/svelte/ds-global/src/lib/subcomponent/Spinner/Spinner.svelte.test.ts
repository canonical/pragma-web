import { describe, expect, it, onTestFinished } from "vitest";
import { commands, page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Component from "./Spinner.svelte";

describe("Spinner subcomponent", () => {
  it("renders the spinner icon", async () => {
    const { container } = await render(Component);
    expect(container.querySelector("use")).toHaveAttribute(
      "href",
      "/icons/spinner.svg#spinner",
    );
  });

  it("applies the spinner class", async () => {
    const { container } = await render(Component);
    expect(container.querySelector("svg")).toHaveClass("ds", "spinner");
  });

  it("is decorative by default", async () => {
    const { container } = await render(Component);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("exposes a named image when aria-label is provided", async () => {
    await render(Component, { "aria-label": "Loading" });
    const svg = page.getByRole("img", { name: "Loading" });
    await expect.element(svg).not.toHaveAttribute("aria-hidden");
  });

  it("exposes a named image when aria-labelledby is provided", async () => {
    const { container } = await render(Component, {
      "aria-labelledby": "label-id",
    });
    expect(container.querySelector("svg")).toHaveAttribute("role", "img");
  });

  it("treats an empty aria-label as decorative", async () => {
    const { container } = await render(Component, { "aria-label": "" });
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("honours an explicit role", async () => {
    await render(Component, { role: "presentation" });
    const svg = page.getByRole("presentation");
    await expect.element(svg).not.toHaveAttribute("aria-hidden");
  });

  it("merges a consumer class alongside the spinner class", async () => {
    const { container } = await render(Component, { class: "test-class" });
    expect(container.querySelector("svg")).toHaveClass("spinner", "test-class");
  });

  it("resolves the icon from a custom rootPath", async () => {
    const { container } = await render(Component, {
      rootPath: "/assets/icons",
    });
    expect(container.querySelector("use")).toHaveAttribute(
      "href",
      "/assets/icons/spinner.svg#spinner",
    );
  });

  describe("motion preference", () => {
    const renderSpinner = async (reducedMotion: "reduce" | "no-preference") => {
      await commands.emulateMedia({ reducedMotion });
      // The emulation outlives this test and applies to every test file
      // sharing the page, so restore Playwright's default afterwards.
      onTestFinished(() =>
        commands.emulateMedia({ reducedMotion: "no-preference" }),
      );
      const { container } = await render(Component);
      const spinner = container.querySelector("svg");
      if (!spinner) throw new Error("spinner not rendered");
      return getComputedStyle(spinner);
    };

    it("spins when no motion preference is set", async () => {
      const style = await renderSpinner("no-preference");
      expect(style.animationName).toBe("ds-spinner-rotate");
    });

    it("holds still under reduced motion", async () => {
      const style = await renderSpinner("reduce");
      expect(style.animationName).toBe("none");
    });
  });
});
