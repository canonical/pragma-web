import { isValidElement } from "react";
import { type API, addons, types } from "storybook/manager-api";
import { beforeAll, describe, expect, it } from "vitest";
import { ADDON_ID, PANEL_ID, TOOL_ID } from "./constants.js";
import { Panel } from "./lib/Panel.js";
import { Tool } from "./lib/Tool.js";

const api = {} as API;

/** What these tests read of an element the addon added to the manager. */
type AddedElement = {
  readonly id: string;
  readonly title: string;
  readonly match?: (options: { viewMode?: string }) => boolean;
  readonly render: (options: { active?: boolean }) => unknown;
};

/** Find the element the addon added under `id` among those of `type`. */
const findAddedElement = (
  type: typeof types.TOOL | typeof types.PANEL,
  id: string,
): AddedElement => {
  const elements: Record<string, AddedElement> = addons.getElements(type);
  const element = Object.values(elements).find((added) => added.id === id);
  if (element === undefined) {
    throw new Error(`Nothing was added as ${id}`);
  }
  return element;
};

beforeAll(async () => {
  await import("./manager.js");
  addons.loadAddons(api);
});

describe("manager", () => {
  it("registers the addon under its id", () => {
    expect(addons.experimental_getRegisteredAddons()).toContain(ADDON_ID);
  });

  it("adds the toolbar button to stories and docs pages", () => {
    const tool = findAddedElement(types.TOOL, TOOL_ID);
    expect(tool.title).toBe("Toggle MSW");
    expect(tool.match?.({ viewMode: "story" })).toBe(true);
    expect(tool.match?.({ viewMode: "docs" })).toBe(true);
    expect(tool.match?.({ viewMode: "settings" })).toBe(false);
    expect(tool.match?.({})).toBe(false);
    const rendered = tool.render({});
    expect(isValidElement(rendered) && rendered.type).toBe(Tool);
  });

  it("adds the handlers panel to stories only", () => {
    const panel = findAddedElement(types.PANEL, PANEL_ID);
    expect(panel.title).toBe("MSW");
    expect(panel.match?.({ viewMode: "story" })).toBe(true);
    expect(panel.match?.({ viewMode: "docs" })).toBe(false);
    const rendered = panel.render({ active: true });
    expect(isValidElement(rendered) && rendered.type).toBe(Panel);
    expect(isValidElement(rendered) && rendered.props).toEqual({
      api,
      active: true,
    });
  });
});
