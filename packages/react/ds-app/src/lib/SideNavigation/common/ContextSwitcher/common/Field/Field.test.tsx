import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Field from "./Field.js";

describe("Field", () => {
  it("is a button showing the name, with a caret, that keeps its props", () => {
    render(
      <Field type="button" aria-haspopup="menu">
        Production
      </Field>,
    );
    const button = screen.getByRole("button", { name: "Production" });
    expect(button).toHaveClass("ds", "side-navigation-context-switcher-field");
    expect(button).toHaveAttribute("aria-haspopup", "menu");
    expect(button.querySelector(".caret")).not.toBeNull();
  });
});
