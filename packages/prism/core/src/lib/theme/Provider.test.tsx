import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import useStoredTheme from "./hooks/useStoredTheme.js";
import StoredThemeProvider from "./Provider.js";

/** Prints the stored theme in scope. */
const StoredTheme = (): ReactElement => (
  <p>{useStoredTheme().theme ?? "none"}</p>
);

/** Records a theme through the stored theme's setter. */
const StoreDark = (): ReactElement => {
  const { setTheme } = useStoredTheme();
  return (
    <button onClick={() => setTheme("dark")} type="button">
      Store dark
    </button>
  );
};

describe("StoredThemeProvider", () => {
  it("hands its theme to every useStoredTheme below it", () => {
    render(
      <StoredThemeProvider theme="dark">
        <StoredTheme />
      </StoredThemeProvider>,
    );
    expect(screen.getByText("dark")).toBeInTheDocument();
  });

  it("hands down no theme when the cookie stores none", () => {
    render(
      <StoredThemeProvider>
        <StoredTheme />
      </StoredThemeProvider>,
    );
    expect(screen.getByText("none")).toBeInTheDocument();
  });

  it("keeps a theme recorded since, though the request's is handed again", () => {
    const { rerender } = render(
      <StoredThemeProvider theme="light">
        <StoreDark />
        <StoredTheme />
      </StoredThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Store dark" }));
    rerender(
      <StoredThemeProvider theme="light">
        <StoreDark />
        <StoredTheme />
      </StoredThemeProvider>,
    );
    expect(screen.getByText("dark")).toBeInTheDocument();
  });
});
