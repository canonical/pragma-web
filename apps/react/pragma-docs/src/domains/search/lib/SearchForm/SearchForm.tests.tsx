// Scaffolded by @canonical/summon-component:react v0.46.0

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import SearchForm from "./SearchForm.js";

describe("SearchForm", () => {
  it("is a GET form whose field, named q, carries the text", () => {
    render(<SearchForm text="but" />);
    const form = screen.getByRole("form", { name: MESSAGES["search.title"] });
    expect(form.getAttribute("method")).toBe("get");
    const field = screen.getByRole("searchbox", {
      name: MESSAGES["search.field"],
    });
    expect(field).toHaveValue("but");
    expect(field.getAttribute("name")).toBe("q");
    expect(
      screen.getByRole("button", { name: MESSAGES["search.submit"] }),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<SearchForm className="custom-class" text="" />);
    const form = screen.getByRole("form", { name: MESSAGES["search.title"] });
    expect(form.className).toBe("ds search-form custom-class");
  });

  it("passes through additional props", () => {
    render(<SearchForm data-testid="test-component" text="" />);
    expect(screen.getByTestId("test-component")).toBeInTheDocument();
  });
});
