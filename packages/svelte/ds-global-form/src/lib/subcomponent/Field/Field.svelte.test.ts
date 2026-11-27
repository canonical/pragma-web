import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import { Description, Error as FieldError, Label } from "./index.js";

const text = (value: string) =>
  createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe("Label", () => {
  it("renders a label bound to its control, marking it required", async () => {
    const page = await render(Label, {
      name: "email",
      for: "x",
      children: text("Email"),
    });
    const label = page.container.querySelector("label");
    expect(label?.getAttribute("for")).toBe("x");
    expect(label?.dataset.required).toBe("true");
    expect(label?.textContent).toBe("Email");
  });

  it("falls back to the name and renders as a legend without `for`", async () => {
    const page = await render(Label, {
      name: "email",
      for: "x",
      tag: "legend",
      isOptional: true,
    });
    const legend = page.container.querySelector("legend");
    expect(legend?.hasAttribute("for")).toBe(false);
    expect(legend?.hasAttribute("data-required")).toBe(false);
    expect(legend?.textContent).toBe("email");
  });

  it("marks an optional field in the optional convention, with custom messages", async () => {
    const page = await render(Label, {
      name: "nick",
      isOptional: true,
      requiredIndicator: "optional",
      messages: { optional: () => "facultatif" },
    });
    expect(page.container.querySelector(".optional")?.textContent).toBe(
      " (facultatif)",
    );
    const english = await render(Label, {
      name: "nick",
      isOptional: true,
      requiredIndicator: "optional",
    });
    expect(english.container.querySelector(".optional")?.textContent).toBe(
      " (optional)",
    );
  });
});

describe("Description", () => {
  it("renders its text, or nothing", async () => {
    const page = await render(Description, {
      id: "d",
      class: "extra",
      children: text("Help"),
    });
    expect(
      page.container.querySelector("p.ds.field-description.extra")?.textContent,
    ).toBe("Help");
    const empty = await render(Description, {});
    expect(empty.container.querySelector("p")?.textContent).toBe("");
  });
});

describe("Error", () => {
  it("announces its message with a decorative icon", async () => {
    const page = await render(FieldError, { children: text("Required") });
    const error = page.container.querySelector("p.ds.field-error");
    expect(error?.getAttribute("role")).toBe("alert");
    expect(error?.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(error?.textContent).toBe("Required");
    const empty = await render(FieldError, {});
    expect(empty.container.querySelector("p")?.textContent).toBe("");
  });
});
