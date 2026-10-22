import { screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { installMatchMedia } from "../../testing/browserStubs.js";
import renderWithProviders from "../../testing/renderWithProviders.js";
import TopBar from "./TopBar.js";

beforeAll(() => {
  installMatchMedia();
});

afterEach(() => {
  // The locale selector persists to a cookie and reflects <html lang dir>.
  // biome-ignore lint/suspicious/noDocumentCookie: test cleanup
  document.cookie = "locale=; max-age=0; path=/";
  document.documentElement.removeAttribute("lang");
  document.documentElement.removeAttribute("dir");
});

describe("TopBar", () => {
  it("renders the app's name as a link home", () => {
    renderWithProviders(<TopBar />);

    expect(screen.getByRole("link", { name: "Boilerplate" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("holds the demo navigation, with a link to the dashboard", () => {
    renderWithProviders(<TopBar />);

    const navigation = screen.getByRole("navigation", { name: "Main" });

    expect(
      within(navigation).getByRole("link", { name: "Dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("holds the theme and language selectors, with the input chrome", () => {
    renderWithProviders(<TopBar />);

    expect(screen.getByRole("combobox", { name: "Color theme" })).toHaveClass(
      "ds",
      "input",
      "select",
    );
    expect(screen.getByRole("combobox", { name: "Language" })).toHaveClass(
      "ds",
      "input",
      "select",
    );
  });

  it("labels each language in its own language", () => {
    renderWithProviders(<TopBar />);

    expect(screen.getByRole("option", { name: "français" })).toHaveAttribute(
      "lang",
      "fr",
    );
  });

  it("merges a consumer class with its own on the header", () => {
    renderWithProviders(<TopBar className="custom" />);

    expect(screen.getByRole("banner")).toHaveClass(
      "ds",
      "top-bar",
      "surface",
      "custom",
    );
  });
});
