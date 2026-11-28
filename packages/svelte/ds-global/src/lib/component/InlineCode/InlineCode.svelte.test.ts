import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Component from "./InlineCode.svelte";
import { code, codeText } from "./test.fixtures.svelte";

describe("InlineCode", () => {
  it("renders children", async () => {
    const page = await render(Component, { children: code });
    await expect.element(page.getByText(codeText)).toBeInTheDocument();
  });

  it("renders a code element", async () => {
    const page = await render(Component, { children: code });
    expect(page.getByText(codeText).element().tagName).toBe("CODE");
  });

  it("applies custom className", async () => {
    const page = await render(Component, {
      children: code,
      class: "custom-class",
    });
    const element = page.getByText(codeText).element();
    expect(element.className).toContain("ds inline-code");
    expect(element.className).toContain("custom-class");
  });

  it("passes through additional props", async () => {
    const page = await render(Component, {
      children: code,
      "data-testid": "test-component",
    });
    await expect
      .element(page.getByTestId("test-component"))
      .toBeInTheDocument();
  });
});
