// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import { BLOCK_EXAMPLES, EXAMPLE_BADGE_VALUE } from "./constants.js";
import UIBlockExample from "./UIBlockExample.js";

/**
 * The compact addresses the published `@canonical/react-ds-global`
 * components implement, as their TSDoc's `@implements` names them.
 */
const PUBLISHED_COMPONENTS = [
  "ds:global.component.accordion",
  "ds:global.component.announcement",
  "ds:global.component.badge",
  "ds:global.component.breadcrumbs",
  "ds:global.component.button",
  "ds:global.component.card",
  "ds:global.component.chip",
  "ds:global.component.contextual_menu",
  "ds:global.component.heading",
  "ds:global.component.icon",
  "ds:global.component.inline_code",
  "ds:global.component.keyboard_key",
  "ds:global.component.label",
  "ds:global.component.link",
  "ds:global.component.popover",
  "ds:global.component.tabs",
  "ds:global.component.tile",
  "ds:global.component.tooltip",
];

describe("UIBlockExample", () => {
  it("renders the published Badge over its count", () => {
    const { container } = render(<UIBlockExample example="badge" />);
    expect(container.firstElementChild).toHaveClass("ds", "badge");
    expect(container.textContent).toBe(String(EXAMPLE_BADGE_VALUE));
  });

  it("renders the published Button as a button that submits nothing", () => {
    render(<UIBlockExample example="button" />);
    const button = screen.getByRole("button", {
      name: MESSAGES["example.button"],
    });
    expect(button).toHaveClass("ds", "button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("renders the published Chip over its value", () => {
    const { container } = render(<UIBlockExample example="chip" />);
    expect(container.firstElementChild).toHaveClass("ds", "chip");
    expect(container.textContent).toBe(MESSAGES["example.chip"]);
  });

  it("renders the published InlineCode over its text", () => {
    const { container } = render(<UIBlockExample example="inlineCode" />);
    expect(container.firstElementChild?.tagName).toBe("CODE");
    expect(container.firstElementChild).toHaveClass("ds", "inline-code");
    expect(container.textContent).toBe(MESSAGES["example.inlineCode"]);
  });

  it("renders the published KeyboardKey over its key", () => {
    const { container } = render(<UIBlockExample example="keyboardKey" />);
    expect(container.firstElementChild).toHaveClass("ds", "keyboard-key");
  });

  it("names a component the published package implements for each block", () => {
    expect(
      [...BLOCK_EXAMPLES.keys()].filter(
        (curie) => !PUBLISHED_COMPONENTS.includes(curie),
      ),
    ).toEqual([]);
  });
});
