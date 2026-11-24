import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import * as decorators from "../../../storybook/decorators.js";
import {
  Modal,
  type WithModalRender,
  withModal,
} from "../../pattern/Modal/index.js";
import { Button } from "../Button/index.js";
import type { MenuEntry } from "../ContextualMenu/index.js";
import Component from "./DropdownButton.js";

const meta = {
  title: "components/DropdownButton",
  component: Component,
  // The menu is a popover in the top layer, which escapes every container,
  // so each docs preview gets its own iframe.
  parameters: {
    docs: {
      story: { inline: false, iframeHeight: "320px" },
      source: { type: "code", language: "tsx" },
    },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lays a row of triggers out with room for their menus. */
const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--dimension-200)",
  alignItems: "start",
};

const actions: MenuEntry[] = [
  { key: "rename", label: "Rename" },
  { key: "duplicate", label: "Duplicate" },
  { type: "separator", key: "danger" },
  { key: "archive", label: "Archive", disabled: true },
  { key: "delete", label: "Delete" },
];

const views: MenuEntry[] = [
  { url: "?view=table", label: "Table" },
  { url: "?view=cards", label: "Cards" },
  { type: "separator", key: "more" },
  { url: "?view=timeline", label: "Timeline" },
];

// Actions alone, which the keyboard story walks.
const quickActions: MenuEntry[] = [
  { key: "rename", label: "Rename" },
  { key: "duplicate", label: "Duplicate" },
  { key: "delete", label: "Delete" },
];

/** A secondary button and its menu, with a disabled item. */
export const Default: Story = {
  args: { importance: "secondary", items: actions, children: "Actions" },
};

/** Importance and anticipation are the wrapped Button's own props. */
export const ImportanceAndAnticipation: StoryFn = () => (
  <div style={{ display: "grid", gap: "var(--dimension-200)" }}>
    {[undefined, ...MODIFIER_FAMILIES.anticipation].map((anticipation) => (
      <div key={anticipation ?? "none"} style={row}>
        {MODIFIER_FAMILIES.importance.map((importance) => (
          <Component
            key={importance}
            importance={importance}
            anticipation={anticipation}
            items={views}
          >
            {anticipation ?? importance}
          </Component>
        ))}
      </div>
    ))}
  </div>
);

/**
 * A leading icon, an icon-only trigger named by `aria-label`, a loading
 * trigger and a disabled one. Loading and disabled triggers cannot open
 * their menus, with or without scripts.
 */
export const IconLoadingAndDisabled: StoryFn = () => (
  <div style={row}>
    <Component importance="secondary" icon="filter" items={views}>
      View
    </Component>
    <Component
      importance="secondary"
      icon="filter"
      aria-label="View"
      items={views}
    />
    <Component importance="secondary" loading items={views}>
      Loading
    </Component>
    <Component importance="secondary" disabled items={views}>
      Disabled
    </Component>
  </div>
);

/** A menu of actions alone, whose trigger hides before scripts. */
export const ActionsOnly: Story = {
  args: { importance: "secondary", items: quickActions, children: "Actions" },
  decorators: [decorators.renderServerMarkup()],
};

/**
 * ArrowDown on the trigger opens the menu on its first item, ArrowUp on its
 * last. Typing jumps to the first item whose label starts with it, Enter
 * chooses, and focus returns to the trigger.
 */
export const Keyboard: StoryFn = () => (
  <Component importance="secondary" items={actions}>
    Actions
  </Component>
);
Keyboard.play = async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole("button", {
    name: "Actions",
  });
  const popover = document.getElementById(
    String(trigger.getAttribute("popovertarget")),
  ) as HTMLElement;
  trigger.focus();
  await userEvent.keyboard("{ArrowDown}");
  await waitFor(() =>
    expect(document.activeElement).toHaveTextContent("Rename"),
  );
  // Escape is the browser's own close request, which a play cannot send, so
  // the trigger closes the menu here.
  await userEvent.click(trigger);
  await waitFor(() => expect(popover.matches(":popover-open")).toBe(false));
  trigger.focus();
  await userEvent.keyboard("{ArrowUp}");
  await waitFor(() =>
    expect(document.activeElement).toHaveTextContent("Delete"),
  );
  await userEvent.keyboard("d");
  await waitFor(() =>
    expect(document.activeElement).toHaveTextContent("Duplicate"),
  );
  await userEvent.keyboard("{Enter}");
  await waitFor(() => expect(popover.matches(":popover-open")).toBe(false));
  await waitFor(() => expect(trigger).toHaveFocus());
};

const MachineModal: WithModalRender = ({ ref }) => (
  <Modal ref={ref}>
    <Modal.Header>Machine</Modal.Header>
    <Modal.Content>
      <Component importance="secondary" items={actions}>
        Actions
      </Component>
    </Modal.Content>
  </Modal>
);

const OpenMachine = withModal(Button, MachineModal);

/**
 * A menu inside a modal. Escape closes only the menu, with focus back on its
 * trigger; the modal stays open until a second Escape.
 */
export const InAModal: StoryFn = () => (
  <OpenMachine importance="secondary">Open machine</OpenMachine>
);
InAModal.parameters = {
  docs: { story: { inline: false, iframeHeight: "480px" } },
};

/** Density comes from the scope, as it does for Button. */
export const Density: StoryFn = () => (
  <div style={row}>
    {["comfortable", "dense"].map((density) => (
      <div key={density} className={density}>
        <Component importance="secondary" items={views}>
          {density}
        </Component>
      </div>
    ))}
  </div>
);
Density.parameters = { baseline: true };

/**
 * Near the end and bottom edges the menu flips to stay in view, and in
 * right-to-left text it mirrors. Browsers without anchor positioning open
 * it centred.
 */
export const PlacementAndRtl: StoryFn = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
      minBlockSize: "280px",
    }}
  >
    <Component importance="secondary" items={views}>
      Start
    </Component>
    <Component importance="secondary" items={views}>
      End
    </Component>
  </div>
);
PlacementAndRtl.decorators = [decorators.rtlDocument()];
