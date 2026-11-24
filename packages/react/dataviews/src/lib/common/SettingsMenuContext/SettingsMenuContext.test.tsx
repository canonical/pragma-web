import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import SettingsMenuContext from "./SettingsMenuContext.js";

/** Draws the menu the context carries, or says there is none. */
const ReadMenu = () => useContext(SettingsMenuContext) ?? <p>No menu</p>;

describe("SettingsMenuContext", () => {
  it("carries no menu outside a settings cell", () => {
    render(<ReadMenu />);
    expect(screen.getByText("No menu")).toBeInTheDocument();
  });

  it("hands down the menu a settings cell installs", () => {
    render(
      <SettingsMenuContext value={<button type="button">Settings</button>}>
        <ReadMenu />
      </SettingsMenuContext>,
    );
    expect(
      screen.getByRole("button", { name: "Settings" }),
    ).toBeInTheDocument();
  });
});
