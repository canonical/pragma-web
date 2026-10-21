import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ThemeSelector from "./ThemeSelector.js";

afterEach(() => {
  // The preference is a cookie at `path=/` plus a class on the root element;
  // clear both so no test's choice leaks into the next.
  // biome-ignore lint/suspicious/noDocumentCookie: test cleanup
  document.cookie = "theme=; path=/; max-age=0";
  document.documentElement.classList.remove("light", "dark");
});

const getSelect = (): HTMLSelectElement =>
  screen.getByRole("combobox", { name: "Color theme" }) as HTMLSelectElement;

describe("ThemeSelector", () => {
  it("renders a labelled select offering system, light and dark", () => {
    render(<ThemeSelector />);
    expect([...getSelect().options].map((option) => option.value)).toEqual([
      "system",
      "light",
      "dark",
    ]);
  });

  it("shows system while no preference is stored", () => {
    render(<ThemeSelector />);
    expect(getSelect().value).toBe("system");
  });

  it("shows the stored preference when there is one", () => {
    // biome-ignore lint/suspicious/noDocumentCookie: test setup
    document.cookie = "theme=dark; path=/";
    render(<ThemeSelector />);
    expect(getSelect().value).toBe("dark");
  });

  it("stores light or dark when chosen", () => {
    render(<ThemeSelector />);
    fireEvent.change(getSelect(), { target: { value: "dark" } });
    expect(document.cookie).toContain("theme=dark");
    expect(getSelect().value).toBe("dark");

    fireEvent.change(getSelect(), { target: { value: "light" } });
    expect(document.cookie).toContain("theme=light");
    expect(getSelect().value).toBe("light");
  });

  it("clears the stored preference when system is chosen", () => {
    // biome-ignore lint/suspicious/noDocumentCookie: test setup
    document.cookie = "theme=dark; path=/";
    render(<ThemeSelector />);
    fireEvent.change(getSelect(), { target: { value: "system" } });
    expect(document.cookie).not.toContain("theme=dark");
    expect(getSelect().value).toBe("system");
  });
});
