// Scaffolded by @canonical/summon-component:react v0.46.0

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import createSearchEnvironment from "../../../../testing/createSearchEnvironment.js";
import createSiteRouter from "../../../../testing/createSiteRouter.js";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  COMPONENT_HREF,
  ONTOLOGY_CLASS_HREF,
} from "../../../../testing/fixtures.js";
import CommandPaletteJump from "./CommandPaletteJump.js";
import type { CommandPaletteJumpProps, PaletteDestinations } from "./types.js";

/** The site's places and the pages read before, as a shell hands them. */
const DESTINATIONS: PaletteDestinations = {
  places: [
    { label: "Components", href: COMPONENT_HREF },
    { label: "Definitions", href: ONTOLOGY_CLASS_HREF },
  ],
  recent: [{ label: "Layout switcher", href: COMPONENT_HREF }],
};

/** Render the jump under the site's providers. */
const renderJump = (props: Partial<CommandPaletteJumpProps> = {}) => {
  const environment = createSearchEnvironment();
  const router = createSiteRouter();
  const onChoose = vi.fn();
  const view = render(
    createSiteTree({
      environment,
      router,
      children: (
        <CommandPaletteJump
          destinations={DESTINATIONS}
          onChoose={onChoose}
          {...props}
        />
      ),
    }),
  );
  return { ...view, environment, router, onChoose };
};

/** The text of each option, in order. */
const readOptions = (): (string | null)[] =>
  screen.getAllByRole("option").map((option) => option.textContent);

/** Press `key` in the field. */
const press = (key: string): void => {
  fireEvent.keyDown(screen.getByRole("combobox"), { key });
};

describe("CommandPaletteJump", () => {
  it("reads Jump to and lists every destination under its group's heading", () => {
    renderJump();
    expect(screen.getByRole("combobox", { name: "Jump to" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Places" })).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Recent pages" }),
    ).toBeInTheDocument();
    expect(readOptions()).toEqual([
      "Components",
      "Definitions",
      "Layout switcher",
    ]);
    expect(screen.queryByRole("option", { selected: true })).toBeNull();
  });

  it("narrows the destinations on the client, ignoring case, and sends no query", () => {
    const { environment } = renderJump();
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: " DEF " },
    });
    expect(readOptions()).toEqual(["Definitions"]);
    expect(screen.queryByRole("group", { name: "Recent pages" })).toBeNull();
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });

  it("opens with the text carried in, narrowed", () => {
    renderJump({ initialText: "switch" });
    expect(screen.getByRole("combobox")).toHaveValue("switch");
    expect(readOptions()).toEqual(["Layout switcher"]);
  });

  it("names the text nothing matches, and hints while it is empty", () => {
    renderJump({ destinations: { places: [], recent: [] } });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Type the name of a lens or of a page you read.",
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "zzzz" },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "No lens or page you read matches “zzzz”.",
    );
  });

  it("moves the highlight from none to the first or the last, wrapping, and none again on typing", () => {
    renderJump();
    const field = screen.getByRole("combobox");
    press("ArrowUp");
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent(
      "Layout switcher",
    );
    expect(field).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { selected: true }).id,
    );
    press("ArrowDown");
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent(
      "Components",
    );
    expect(screen.getByRole("option", { selected: true })).toHaveClass(
      "option is-active",
    );
    fireEvent.change(field, { target: { value: "s" } });
    expect(screen.queryByRole("option", { selected: true })).toBeNull();
    expect(field).not.toHaveAttribute("aria-activedescendant");
    press("ArrowDown");
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent(
      "Components",
    );
  });

  it("leaves the field's other keys alone, and the arrows while nothing is listed", () => {
    renderJump({ destinations: { places: [], recent: [] } });
    const arrow = fireEvent.keyDown(screen.getByRole("combobox"), {
      key: "ArrowDown",
    });
    const home = fireEvent.keyDown(screen.getByRole("combobox"), {
      key: "Home",
    });
    expect([arrow, home]).toEqual([true, true]);
  });

  it("highlights the option a pointer moves over", () => {
    renderJump();
    fireEvent.pointerMove(screen.getByRole("option", { name: "Definitions" }));
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent(
      "Definitions",
    );
  });

  it("does nothing on Enter with none highlighted", () => {
    const { onChoose, router } = renderJump();
    press("Enter");
    expect(onChoose).not.toHaveBeenCalled();
    expect(router.getState().location.pathname).toBe("/");
  });

  it("follows the highlighted destination's link through the router on Enter", async () => {
    const { onChoose, router } = renderJump();
    press("ArrowDown");
    press("ArrowDown");
    press("Enter");
    expect(onChoose).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(router.getState().location.pathname).toBe(ONTOLOGY_CLASS_HREF);
    });
  });

  it("keeps the focus in the field when a pointer presses an option", () => {
    renderJump();
    const pressed = fireEvent.mouseDown(
      screen.getByRole("option", { name: "Components" }),
    );
    expect(pressed).toBe(false);
  });

  it("leaves every key to an input method composing text", () => {
    renderJump();
    fireEvent.keyDown(screen.getByRole("combobox"), {
      key: "ArrowDown",
      isComposing: true,
    });
    expect(screen.queryByRole("option", { selected: true })).toBeNull();
  });

  it("applies a custom className and passes through additional props", () => {
    const { container } = renderJump({
      className: "custom",
      "data-testid": "jump",
    } as Partial<CommandPaletteJumpProps>);
    expect(container.firstElementChild).toHaveClass(
      "ds",
      "command-palette-jump",
      "custom",
    );
    expect(screen.getByTestId("jump")).toBeInTheDocument();
  });
});
