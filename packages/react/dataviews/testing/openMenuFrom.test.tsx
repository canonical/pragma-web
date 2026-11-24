import { Button, withContextualMenu } from "@canonical/react-ds-global";
import { installPopoverStandIn } from "@canonical/react-ds-global/testing";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import openMenuFrom from "./openMenuFrom.js";

const Actions = withContextualMenu(Button);

describe("openMenuFrom", () => {
  let uninstall: () => void;
  beforeAll(() => {
    uninstall = installPopoverStandIn();
  });
  afterAll(() => {
    uninstall();
  });

  it("opens the menu and returns it once focus is inside", async () => {
    render(<Actions items={[{ key: "copy", label: "Copy" }]}>Actions</Actions>);
    const menu = await openMenuFrom(
      screen.getByRole("button", { name: "Actions" }),
    );
    expect(menu).toHaveAttribute("role", "menu");
    expect(screen.getByRole("menuitem", { name: "Copy" })).toHaveFocus();
  });

  it("refuses a button that names no popover", async () => {
    render(<Button>Plain</Button>);
    await expect(
      openMenuFrom(screen.getByRole("button", { name: "Plain" })),
    ).rejects.toThrow("a menu button names its popover");
  });
});
