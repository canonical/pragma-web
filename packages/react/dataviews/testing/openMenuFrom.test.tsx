import { Button } from "@canonical/react-ds-global";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withDropdownMenu } from "../src/lib/common/DropdownButtonStandIn/index.js";
import installPopoverStandIn from "./installPopoverStandIn.js";
import openMenuFrom from "./openMenuFrom.js";

const Actions = withDropdownMenu(Button);

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

  it("refuses a button that names no panel", async () => {
    render(<Button>Plain</Button>);
    await expect(
      openMenuFrom(screen.getByRole("button", { name: "Plain" })),
    ).rejects.toThrow("a menu button names its panel");
  });
});
