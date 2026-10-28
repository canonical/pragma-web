import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import useStoredTheme from "./hooks/useStoredTheme.js";
import StoredThemeProvider from "./Provider.js";

/** Prints the stored theme in scope. */
const StoredTheme = (): ReactElement => <p>{useStoredTheme() ?? "none"}</p>;

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
});
