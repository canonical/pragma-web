import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type API, ManagerContext } from "storybook/manager-api";
import { convert, ThemeProvider } from "storybook/theming";
import { afterEach, describe, expect, it, vi } from "vitest";
import { KEY } from "../constants.js";
import { Tool } from "./Tool.js";

/**
 * Render the toolbar button against a manager whose globals hold `globals`,
 * and whose story sets `storyGlobals`, and return the manager's
 * `updateGlobals`.
 *
 * @note Impure: renders into the document.
 */
const renderTool = (
  globals: Record<string, unknown>,
  storyGlobals: Record<string, unknown> = {},
) => {
  const updateGlobals = vi.fn();
  const api = {
    getGlobals: () => globals,
    getStoryGlobals: () => storyGlobals,
    getUserGlobals: () => globals,
    updateGlobals,
  } as unknown as API;
  render(
    <ThemeProvider theme={convert()}>
      <ManagerContext.Provider value={{ api, state: {} as never }}>
        <Tool api={api} />
      </ManagerContext.Provider>
    </ThemeProvider>,
  );
  return updateGlobals;
};

afterEach(cleanup);

describe("Tool", () => {
  it("shows MSW as active, and turns it off when pressed", () => {
    const updateGlobals = renderTool({ [KEY]: true });
    const toggle = screen.getByRole("switch", { name: "MSW Active" });
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(toggle);
    expect(updateGlobals).toHaveBeenCalledWith({ [KEY]: false });
  });

  it("shows MSW as inactive, and turns it on when pressed", () => {
    const updateGlobals = renderTool({ [KEY]: false });
    const toggle = screen.getByRole("switch", { name: "MSW Inactive" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(toggle);
    expect(updateGlobals).toHaveBeenCalledWith({ [KEY]: true });
  });

  it("is disabled while the story itself sets the global", () => {
    const updateGlobals = renderTool({ [KEY]: true }, { [KEY]: true });
    const toggle = screen.getByRole("switch", { name: "MSW Active" });
    expect(toggle.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(toggle);
    expect(updateGlobals).not.toHaveBeenCalled();
  });
});
