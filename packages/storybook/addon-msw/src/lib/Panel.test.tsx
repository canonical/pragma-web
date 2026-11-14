import { cleanup, render, screen } from "@testing-library/react";
import type { RequestHandler } from "msw";
import { type API, ManagerContext } from "storybook/manager-api";
import { convert, ThemeProvider } from "storybook/theming";
import { afterEach, describe, expect, it } from "vitest";
import { options } from "../../testing/fixtures.js";
import { PARAM_KEY } from "../constants.js";
import type { MswParameter } from "../types.js";
import { Panel } from "./Panel.js";

/**
 * Render the panel, shown or not, against a manager whose current story
 * declares `parameter` as its `parameters.msw`, and return the rendered
 * container.
 *
 * @note Impure: renders into the document.
 */
const renderPanel = (
  active: boolean,
  parameter: MswParameter | undefined,
): HTMLElement => {
  const api = {
    getCurrentParameter: (key: string) =>
      key === PARAM_KEY ? parameter : undefined,
    on: () => undefined,
    off: () => undefined,
  } as unknown as API;
  return render(
    <ThemeProvider theme={convert()}>
      <ManagerContext.Provider value={{ api, state: {} as never }}>
        <Panel api={api} active={active} />
      </ManagerContext.Provider>
    </ThemeProvider>,
  ).container;
};

afterEach(cleanup);

describe("Panel", () => {
  it("renders nothing while the panel is not shown", () => {
    const container = renderPanel(false, { handlers: [options] });
    expect(container.childElementCount).toBe(0);
  });

  it("renders nothing for a story that declares no handlers", () => {
    expect(renderPanel(true, undefined).childElementCount).toBe(0);
    expect(renderPanel(true, { disable: true }).childElementCount).toBe(0);
  });

  it("counts the story's handlers, and names msw's as HTTP handlers", async () => {
    renderPanel(true, { handlers: [options, options] });
    expect(screen.getByText("Active MSW Handlers")).toBeTruthy();
    expect(screen.getByText("2 handlers registered")).toBeTruthy();
    await screen.findAllByText(/HTTP Handler/);
  });

  it("counts one handler in the singular", () => {
    renderPanel(true, { handlers: [options] });
    expect(screen.getByText("1 handler registered")).toBeTruthy();
  });

  it("names a handler it cannot describe as unknown", async () => {
    const container = renderPanel(true, {
      handlers: [{} as RequestHandler, { info: {} } as RequestHandler],
    });
    expect(screen.getByText("2 handlers registered")).toBeTruthy();
    await screen.findAllByText(/Unknown Handler/);
    expect(container.textContent).not.toContain("HTTP Handler");
  });
});
