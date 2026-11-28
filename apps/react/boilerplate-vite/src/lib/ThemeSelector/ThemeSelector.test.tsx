import { I18nProvider } from "@canonical/i18n-react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { catalogs, i18nConfig } from "#i18n/index.js";
import { installMatchMedia } from "../../testing/browserStubs.js";
import ThemeSelector from "./ThemeSelector.js";

function renderSelector() {
  return render(
    <I18nProvider config={i18nConfig} catalogs={catalogs}>
      <ThemeSelector />
    </I18nProvider>,
  );
}

beforeAll(() => {
  installMatchMedia();
});

afterEach(() => {
  // biome-ignore lint/suspicious/noDocumentCookie: test cleanup
  document.cookie = "theme=; max-age=0; path=/";
  document.documentElement.classList.remove("light", "dark");
});

describe("ThemeSelector component", () => {
  it("applies a theme on change: the class on <html> and the cookie", () => {
    renderSelector();

    fireEvent.change(screen.getByRole("combobox", { name: "Color theme" }), {
      target: { value: "dark" },
    });

    expect(document.documentElement).toHaveClass("dark");
    expect(document.cookie).toContain("theme=dark");
  });

  it("follows the system again, clearing the class and the cookie", () => {
    renderSelector();
    const select = screen.getByRole("combobox", { name: "Color theme" });

    fireEvent.change(select, { target: { value: "dark" } });
    fireEvent.change(select, { target: { value: "system" } });

    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.cookie).not.toContain("theme=dark");
    expect(select).toHaveValue("system");
  });

  it("is a form posting to /preferences, with no Apply button while JavaScript runs", () => {
    renderSelector();
    const select = screen.getByRole("combobox", { name: "Color theme" });

    expect(select).toHaveAttribute("name", "theme");
    expect(select.closest("form")).toHaveAttribute("action", "/preferences");
    expect(select.closest("form")).toHaveAttribute("method", "post");
    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
  });
});
