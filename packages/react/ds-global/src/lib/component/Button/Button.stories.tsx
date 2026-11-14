import { ICON_NAMES } from "@canonical/ds-assets";
import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { Fragment } from "react";
import { fn, userEvent } from "storybook/test";

import Component from "./Button.js";

/**
 * Render every story on a real surface: the `.surface` class defines the
 * `--surface-color-*` channels and the div paints itself with them (surfaces
 * consume themselves), so buttons sit on the same background they would in an
 * app rather than the bare Storybook canvas.
 */
const surface: Decorator = (Story) => (
  <div
    className="surface"
    style={{
      background: "var(--surface-color-background)",
      color: "var(--surface-color-text)",
      padding: "var(--dimension-300, 24px)",
    }}
  >
    <Story />
  </div>
);

const meta = {
  title: "components/Button",
  component: Component,
  decorators: [surface],
  argTypes: {
    // Importance is never blank — primary is the default hierarchy.
    importance: {
      control: "select",
      options: [...MODIFIER_FAMILIES.importance],
    },
    anticipation: {
      control: "select",
      options: [undefined, ...MODIFIER_FAMILIES.anticipation],
    },
    variant: {
      control: "select",
      options: [undefined, "link"],
    },
    // Icon is a design-system icon NAME (not arbitrary markup): a select over the
    // ds-assets icon set, with `undefined` = no icon (the default).
    icon: {
      control: "select",
      options: [undefined, ...ICON_NAMES],
    },
  },
  args: { onClick: fn(), importance: "primary" },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

/** The importance × anticipation grid: importance as rows, the neutral base
 *  plus every anticipation as columns. Shared by the Matrix and DisabledMatrix
 *  stories. */
const MatrixGrid = (args: React.ComponentProps<typeof Component>) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `auto repeat(${
        MODIFIER_FAMILIES.anticipation.length + 1
      }, auto)`,
      gap: "0.75rem 1rem",
      alignItems: "center",
      justifyItems: "start",
    }}
  >
    {/* Header row: blank corner + column labels. */}
    <span />
    <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>neutral</span>
    {MODIFIER_FAMILIES.anticipation.map((a) => (
      <span key={a} style={{ fontSize: "0.75rem", opacity: 0.6 }}>
        {a}
      </span>
    ))}

    {/* One row per importance. */}
    {MODIFIER_FAMILIES.importance.map((importance) => (
      <Fragment key={importance}>
        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{importance}</span>
        <span
          data-button-focus-clip={importance}
          style={{ display: "inline-flex", overflow: "hidden" }}
        >
          <Component
            {...args}
            data-button-focus-importance={importance}
            importance={importance}
          >
            Button
          </Component>
        </span>
        {MODIFIER_FAMILIES.anticipation.map((anticipation) => (
          <Component
            key={anticipation}
            {...args}
            importance={importance}
            anticipation={anticipation}
          >
            Button
          </Component>
        ))}
      </Fragment>
    ))}
  </div>
);

/**
 * The full variant matrix: each importance (rows) combined with the neutral
 * base and every anticipation (columns). Importance decides how the colour is
 * applied — primary fills, secondary outlines, tertiary is text — while
 * anticipation (and the neutral base) decides which colour. The two compose
 * orthogonally.
 */
export const Matrix: Story = {
  render: (args) => (
    <div data-global-button-matrix-proof="">
      <MatrixGrid {...args} />
    </div>
  ),
  args: { children: "Button" },
  play: async ({ canvasElement }) => {
    const proofRoot = canvasElement.querySelector<HTMLElement>(
      "[data-global-button-matrix-proof]",
    );
    const proofWindow = canvasElement.ownerDocument.defaultView;
    if (!proofRoot || !proofWindow)
      throw new Error("missing Global Button matrix proof root");
    for (const key of [
      "globalButtonFocusProof",
      "globalButtonFocusProofError",
      "globalButtonFocusVariants",
      "globalButtonForcedColors",
    ] as const)
      delete proofRoot.dataset[key];

    const initialFocus =
      canvasElement.ownerDocument.activeElement instanceof HTMLElement
        ? canvasElement.ownerDocument.activeElement
        : null;
    const variants = ["primary", "secondary", "tertiary"] as const;
    const buttons = variants.map((importance) =>
      proofRoot.querySelector<HTMLButtonElement>(
        `[data-button-focus-importance="${importance}"]`,
      ),
    );
    const clips = variants.map((importance) =>
      proofRoot.querySelector<HTMLElement>(
        `[data-button-focus-clip="${importance}"]`,
      ),
    );
    if (buttons.some((button) => !button) || clips.some((clip) => !clip))
      throw new Error("missing Global Button focus fixtures");
    const focusButtons = buttons as HTMLButtonElement[];
    const focusClips = clips as HTMLElement[];
    const originalStyles = new Map(
      focusButtons.map((button) => [button, button.getAttribute("style")]),
    );
    const beforeRects = focusButtons.map((button) =>
      button.getBoundingClientRect(),
    );
    const px = (value: string, label: string): number => {
      const result = Number.parseFloat(value);
      if (!Number.isFinite(result)) throw new Error(`${label} is not finite`);
      return result;
    };
    const near = (actual: number, expected: number, label: string): void => {
      if (!Number.isFinite(actual) || Math.abs(actual - expected) > 0.05)
        throw new Error(`${label}: expected ${expected}, received ${actual}`);
    };
    const assertSameGeometry = (label: string): void => {
      const reference = focusButtons[0]?.getBoundingClientRect();
      if (!reference) throw new Error("missing reference Global Button");
      focusButtons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        near(rect.width, reference.width, `${label} ${variants[index]} width`);
        near(
          rect.height,
          reference.height,
          `${label} ${variants[index]} height`,
        );
        near(
          rect.width,
          beforeRects[index]?.width ?? Number.NaN,
          `${label} stable width`,
        );
        near(
          rect.height,
          beforeRects[index]?.height ?? Number.NaN,
          `${label} stable height`,
        );
      });
    };
    const assertInwardFocus = (
      button: HTMLButtonElement,
      clip: HTMLElement,
      label: string,
    ): void => {
      if (
        canvasElement.ownerDocument.activeElement !== button ||
        !button.matches(":focus-visible")
      )
        throw new Error(`${label} did not receive keyboard focus-visible`);
      if (proofWindow.getComputedStyle(clip).overflow !== "hidden")
        throw new Error(`${label} clipping fixture is inactive`);
      const style = proofWindow.getComputedStyle(button);
      const width = px(style.outlineWidth, `${label} outline width`);
      const offset = px(style.outlineOffset, `${label} outline offset`);
      if (
        width <= 0 ||
        style.outlineStyle === "none" ||
        style.outlineColor === "transparent" ||
        style.outlineColor === "rgba(0, 0, 0, 0)"
      )
        throw new Error(`${label} focus paint is not visible`);
      near(offset, -width, `${label} inward outline offset`);
      if (offset + width > 0)
        throw new Error(`${label} focus paint escapes its visual bounds`);
    };
    const focusByKeyboard = async (
      target: HTMLButtonElement,
    ): Promise<void> => {
      for (
        let attempt = 0;
        attempt <= proofRoot.querySelectorAll("button").length;
        attempt += 1
      ) {
        if (canvasElement.ownerDocument.activeElement === target) return;
        await userEvent.tab();
      }
      throw new Error("keyboard navigation did not reach a Matrix Button");
    };

    try {
      assertSameGeometry("resting variants");
      const active = canvasElement.ownerDocument.activeElement;
      if (active instanceof HTMLElement) active.blur();
      for (let index = 0; index < focusButtons.length; index += 1) {
        const button = focusButtons[index];
        const clip = focusClips[index];
        if (!button || !clip) throw new Error("missing focus proof variant");
        await focusByKeyboard(button);
        assertInwardFocus(button, clip, `${variants[index]} Button`);
        assertSameGeometry(`focused ${variants[index]}`);
      }

      const overrideButton = focusButtons[2];
      if (!overrideButton) throw new Error("missing focus override Button");
      overrideButton.style.setProperty("--focus-outline-offset", "5px");
      await new Promise<void>((resolve) =>
        proofWindow.requestAnimationFrame(() => resolve()),
      );
      const overrideStyle = proofWindow.getComputedStyle(overrideButton);
      near(
        px(
          overrideStyle.getPropertyValue("--focus-outline-offset"),
          "consumer focus offset property",
        ),
        5,
        "consumer focus offset property",
      );
      const computedOverrideOffset = px(
        overrideStyle.outlineOffset,
        "computed consumer focus offset",
      );
      if (
        Math.abs(computedOverrideOffset - 5) >
        1 / proofWindow.devicePixelRatio + 0.01
      )
        throw new Error(
          `consumer focus offset exceeded one device pixel: ${computedOverrideOffset}`,
        );
      assertSameGeometry("consumer focus override");
      overrideButton.style.removeProperty("--focus-outline-offset");
      await new Promise<void>((resolve) =>
        proofWindow.requestAnimationFrame(() => resolve()),
      );
      assertInwardFocus(
        overrideButton,
        focusClips[2] as HTMLElement,
        "restored tertiary Button",
      );
      assertSameGeometry("restored focus override");
    } catch (error) {
      proofRoot.dataset.globalButtonFocusProofError =
        error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      for (const [button, style] of originalStyles) {
        if (style === null) button.removeAttribute("style");
        else button.setAttribute("style", style);
      }
      const active = canvasElement.ownerDocument.activeElement;
      if (active instanceof HTMLElement) active.blur();
      if (initialFocus?.isConnected) initialFocus.focus();
    }
    proofRoot.dataset.globalButtonFocusVariants = String(focusButtons.length);
    proofRoot.dataset.globalButtonForcedColors = proofWindow.matchMedia(
      "(forced-colors: active)",
    ).matches
      ? "active"
      : "none";
    proofRoot.dataset.globalButtonFocusProof = "passed";
  },
};

/**
 * The same matrix in the disabled state — every importance × anticipation
 * combination rendered `disabled`, so the disabled treatment is visible across
 * the whole grid.
 */
export const DisabledMatrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button", disabled: true },
};

/**
 * Link variant renders as inline text with underline.
 */
export const LinkVariant: Story = {
  args: {
    children: "Learn more",
    variant: "link",
  },
};

/**
 * The full matrix with a leading icon in every cell — so the icon colour can be
 * checked against each importance × anticipation combination (the icon should
 * follow the label colour: contrast on a filled primary, the modifier colour on
 * ghost secondary/tertiary). The `icon` prop takes a design-system icon name;
 * the sprite is served from the `@canonical/ds-assets` staticDir at `/icons`.
 */
export const IconMatrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button", icon: "edit" },
};

/**
 * The icon matrix in the disabled state — the icon should dim with the label
 * across every combination.
 */
export const DisabledIconMatrix: Story = {
  render: (args) => <MatrixGrid {...args} />,
  args: { children: "Button", icon: "edit", disabled: true },
};

/**
 * A loading button shows a Spinner in the leading icon slot, is marked
 * `aria-busy`, and is disabled so the action cannot be triggered again while
 * it is in flight.
 */
export const Loading: Story = {
  args: {
    children: "Saving",
    loading: true,
  },
};
